const moment = require('moment');
const projinfo = require('./ProjectInfo.js');
const plansjs = require('./plans.js');
const logging = require('./logging.js');
const DBLinks = require('./DBLinks.js');
const sms = require('./SMS.js');
const helpers = require('./helpers.js');

const admin = projinfo.admin;
const root = projinfo.root;
const stripe = projinfo.stripe;
const STRIPE_ACCT_ID = projinfo.STRIPE_ACCT_ID;

const PLANS = plansjs.PLANS;
const DB = DBLinks.DB;
const { log, err_log, ok_log, table_log, log_group_begin: group_begin, log_group_end: group_end, prettify } = logging;

// ____________________________________________________________________________

const get_plan_total_counts    = async () => await Promise.all(PLANS.map(async (plan) => ({ title: plan.title, users: await DB.Plan_totalCount(plan.title).promiseBoxedFetch() })));
const get_plan_most_recents    = async () => await Promise.all(PLANS.map(async (plan) => ({ title: plan.title, users: await DB.Plan_mostRecent(plan.title).promiseBoxedFetch() })));
const mostRecentlyAddedEvent   = async () => await DB.Event_allEvents().limitedFetchChildren(1);
const get_all_events           = async () => await DB.Event_allEvents().fetchChildren();
const getActiveEventId         = async () => await DB.Event_active().fetch();
const getStripeCustomerId      = async (uid) => await DB.User_stripeCustId(uid).fetch();
const canPostEvents            = async (uid) => await DB.Admin_checkUser(uid).fetch();
const getTotalDonated          = async (uid) => await DB.User_totalDonated(uid).fetch();
const getPrevChargeStatus      = async (uid) => await DB.User_prevChargeStatus(uid).fetch();
const getUserInfo              = async (uid) => await DB.User_info(uid).fetch();
const getUserSubscriptionId    = async (uid) => await DB.User_stripeSubId(uid).fetch();
const eventSnapshot            = async (eventId) => await DB.Event_info(eventId).fetch();
const getTotalUsersForEvent    = async (eventId) => await DB.Event_totalUsers(eventId).fetch();
const getTotalIncomeForEvent   = async (eventId) => await DB.Event_totalDonated(eventId).fetch();
const userHasAlreadyVoted      = async (eid, uid) => (await DB.User_choiceForEvent(uid, eid).fetch()) !== null;
const getPremiumPlanTotalCount = async (plan) => await DB.Plan_totalCount(plan).fetch();
const getPremiumPlanMostRecent = async (plan) => await DB.Plan_mostRecent(plan).fetch();
const get_decoded_token        = async (idToken) => await admin.auth().verifyIdToken(idToken);

const userExists = async (uid) => {
  try {
    const x = await admin.auth().getUser(uid);
    return x;
  } catch (e) { return null; }
};

const get_most_recent_ev = async () => {
  const evs = await get_all_events();
  for (let i = 0; i < evs.length; i++) {
    if (!evs[i].used) return evs[i];
  }
  return null;
};

const getWinningOptionForEvent = async (active_event_id) => {
  try {
    let options = await eventSnapshot(active_event_id);
    options = options.o;
    const winner = { votes: null, id: null };

    Object.keys(options).forEach((key) => {
      if (options[key].vrs != null) {
        const votes = options[key].ttl;
        if (votes > winner.votes) {
          winner.votes = votes;
          winner.id = key;
        } else if (votes === winner.votes) {
          // Randomly determine winner on tie
          if (Math.random() > 0.5) {
            winner.votes = votes;
            winner.id = key;
          }
        }
      }
    });

    return winner;
  } catch (e) {
    err_log('Get winning opt error: ' + e);
    throw new Error('Could not get winning option');
  }
};

const haveProcessedUserPaymentForEvent = async (uid, eventId) => {
  const event_ref = root.ref('/users/' + uid + '/v/' + eventId + '/don');
  return new Promise(async (resolve, reject) => {
    event_ref.once('value').then(async (snapshot) => {
      if (!snapshot.val()) {
        resolve('ok');
      } else {
        reject('Already Voted!');
      }
    });
  });
};

/**
 * Process charged customer info through 8 sequential phases.
 * Each phase fetches and prepares data needed for the charge record.
 */
const process_charged_customer_info = async (cust_id, amountContributed) => {
  return new Promise(async (resolve, reject) => {
    group_begin('Processing Customer info');

    let uid, active_event, incomeForEvent, totalDonated, totalEventUsers, planTotalCount;
    let p_incomeForEvent, p_totalDonated, p_totalEventUsers, p_planTotalCount;

    /* Phase 1 - Firebase UID from Stripe Customer Id */
    try { uid = await getFirebaseUserFromCustomerId(cust_id); }
    catch (e) { err_log('Could not find firebase user for stripe user!'); reject('Could not find firebase user for stripe user! -> ' + e); group_end(); return null; }
    ok_log(' (1/8) Found uid -> ' + uid);

    /* Phase 2 - Get Active Event */
    try { active_event = await getActiveEventId(); }
    catch (e) { err_log(e); reject(e); group_end(); return null; }
    ok_log(' (2/8) Found active event -> ' + active_event);

    /* Phase 3 - Check that we are not processing an already-processed user */
    try { await haveProcessedUserPaymentForEvent(uid, active_event); }
    catch (e) { err_log('We have already processed this user! -> ' + e); reject(e); group_end(); return null; }
    ok_log(' (3/8) we have not yet processed user payment for this month');

    /* Phase 4 - Get total amount contributed to this event & increment */
    try { p_incomeForEvent = Number(await getTotalIncomeForEvent(active_event)); }
    catch (e) { err_log(e); reject(e); group_end(); return null; }
    incomeForEvent = p_incomeForEvent + amountContributed;
    ok_log(' (4/8) got and incremented income');

    /* Phase 5 - Get total amount the user has donated & increment */
    try { p_totalDonated = Number(await getTotalDonated(uid)); }
    catch (e) { err_log(e); reject(e); group_end(); return null; }
    totalDonated = p_totalDonated + amountContributed;
    ok_log(' (5/8) got amount donated and incremented -> ' + totalDonated + ' (contributed ' + amountContributed + ')');

    /* Phase 6 - Get and increment the total number of users contributing to this event */
    try { p_totalEventUsers = Number(await getTotalUsersForEvent(active_event)); }
    catch (e) { err_log(e); reject(e); group_end(); return null; }
    totalEventUsers = p_totalEventUsers + 1;
    ok_log(' (6/8) got total event users and incremented -> uid is ' + uid);

    /* Phase 7 - Get user's plan */
    let user_plan;
    try {
      const userInfo = await getUserInfo(uid);
      ok_log('got userinfo');
      user_plan = userInfo['p'].split(',')[0];
    }
    catch (e) { err_log(e); reject(e); group_end(); return null; }
    ok_log(' (7/8) got user plan -> ' + user_plan);

    /* Phase 8 - Get and increment the plan total count */
    try { p_planTotalCount = Number(await getPremiumPlanTotalCount(user_plan)); }
    catch (e) { err_log(e); reject(e); group_end(); return null; }
    planTotalCount = p_planTotalCount + 1;
    ok_log(' (8/8) got plan total count -> ' + planTotalCount);

    ok_log('completed db requests');

    resolve({
      uid,
      active_event,
      amountContributed,
      p_totalDonated,
      totalDonated,
      p_incomeForEvent,
      incomeForEvent: Math.round(incomeForEvent * 1000) / 1000,
      user_plan,
      p_totalEventUsers,
      totalEventUsers,
      p_planTotalCount,
      planTotalCount,
      formatted_time: moment().format('LL')
    });
  });
};

const customer_charged_successfully = async (cust_id, amountContributed) => {
  group_begin('customer charged successfully');
  return new Promise(async (resolve, reject) => {
    let processed_info;
    try {
      processed_info = await process_charged_customer_info(cust_id, amountContributed);
      ok_log('processed charged customer info.');
    } catch (e) {
      err_log(e);
      reject('We could not properly process user info.');
      return;
    }

    if (processed_info == null) { reject('We could not properly process user info.'); return; }

    DB.User_donationForEvent(processed_info.uid, processed_info.active_event).set(amountContributed);
    DB.User_totalDonated(processed_info.uid).set(processed_info.totalDonated);
    DB.Event_totalDonated(processed_info.active_event).set(processed_info.incomeForEvent);
    DB.Event_totalUsers(processed_info.active_event).set(processed_info.totalEventUsers);
    DB.Plan_totalCount(processed_info.user_plan).set(processed_info.planTotalCount);
    DB.Plan_mostRecent(processed_info.user_plan).set(processed_info.formatted_time);
    DB.User_prevChargeStatus(processed_info.uid).set('OK');

    ok_log('Finished processing charge!');
    group_end();

    resolve(processed_info);
  });
};

const performMonthlyRollover = () => {
  return new Promise(async (resolve, reject) => {
    group_begin('Monthly Rollover');
    try {
      log('Payout created');
      const active_event = await getActiveEventId();
      const winningOption = await getWinningOptionForEvent(active_event);

      const ref_string = '/db/events/' + active_event + '/w';
      log('Got options.. now ref string is => ' + ref_string);
      log('winning op was: ' + JSON.stringify(winningOption));

      const nextEvent = await get_most_recent_ev();

      root.ref('/db/events/' + active_event + '/used').set(true);

      log('Next event id => ' + nextEvent.id + ' (from ' + active_event + ')');

      if (nextEvent.id === active_event) {
        // No next event to roll over to
        if (process.env.ADMIN_PHONE) {
          sms.send_text_message(process.env.ADMIN_PHONE, 'Problem: There is nowhere for GA to rollover to. Need to add a new event.');
        }
        err_log('Missing a next month to rollover to!');
        resolve('Good');
        return;
      }

      ok_log('Rolling Over');
      root.ref(ref_string).set(winningOption);
      root.ref('/db/active_event/').set(nextEvent.id);
      sms.notifyPeople();

      resolve('Good!');
    } catch (e) {
      err_log(e);
      reject(e);
    }
    group_end();
  });
};

const planIDForNameAndAmt = (untrimmed_nameAndAmt) => {
  const plan_title = untrimmed_nameAndAmt.split(',')[0];
  return plansjs.idForPlanWithTitle(plan_title);
};

const quantityForNameAndAmt = (untrimmed_nameAndAmt) => {
  const split = untrimmed_nameAndAmt.split(',');
  const plan_title = split[0];
  const money_being_spent = parseFloat(split[1]);
  if (typeof money_being_spent !== 'number') throw new Error('Quantity error: must be a number');
  const price = plansjs.priceForPlanWithTitle(plan_title) || 1.0;
  if (price === 1) {
    if (money_being_spent % 1 !== 0) throw new Error('Quantity error: must be whole number');
    if (money_being_spent < plansjs.lowestPlanCost()) throw new Error('Quantity error: must be higher than lowest plan.');
  }
  return price !== 1.0 ? 1 : money_being_spent;
};

const getFirebaseUserFromCustomerId = async (cust_id) => {
  const uid = await DB.Stripe_uidForCustomer(cust_id).fetch();
  if (!uid) throw new Error('Could not find uid');
  return uid;
};

const get_plan_stats = async () => {
  const counts = await get_plan_total_counts();
  const recents = await get_plan_most_recents();
  return { counts, recents };
};

const user_info_problems = (userJson) => {
  const check_string = (s, minlen, maxlen) => s && typeof s === 'string' && s.length > minlen && s.length < maxlen;

  const nameIsOk = check_string(userJson.n, 3, 50);
  const emailIsOk = check_string(userJson.e, 3, 100) && helpers.validateEmail(userJson.e);
  const planIsOk = userJson.p != null && planIDForNameAndAmt(userJson.p) != null;
  const phoneIsOk = userJson.z != null && helpers.validatePhone(userJson.z);

  if (!nameIsOk) return 'Please check your name, it doesn\'t appear to be valid!';
  if (!emailIsOk) return 'Please check your email, it doesn\'t appear to be valid!';
  if (!phoneIsOk) return 'Please check your phone number (' + userJson.z + '), it doesn\'t appear to be valid!';
  if (!planIsOk) return 'Please check your plan, it doesn\'t appear to be selected!';
  return null;
};

function postUserInfo(n, e, p, dn, z, uid) {
  const userJson = {
    n,
    e,
    p,
    dn,
    j: helpers.getToday(),
    z
  };

  const problems = user_info_problems(userJson);
  if (problems == null) {
    DB.User_info(uid).set(userJson);
    DB.User_totalDonated(uid).set(0);
    return true;
  }
  return false;
}

async function executeCreateSubscription(uid, planNameAndAmount) {
  return new Promise(async (resolve, reject) => {
    try {
      const customer_id = await getStripeCustomerId(uid);
      const plan = planIDForNameAndAmt(planNameAndAmount);
      const amt = quantityForNameAndAmt(planNameAndAmount);

      log('Plan: ' + plan + '  Amt: ' + amt);

      const subscription_params = { customer: customer_id, items: [{ plan, quantity: amt }] };
      const ga_account_params = { stripe_account: STRIPE_ACCT_ID };

      const callback = async (err, subscription) => {
        if (subscription) {
          DB.User_stripeSubId(uid).set(subscription.id);
          root.ref('/queriable/' + uid + '/p').set(planNameAndAmount);
          ok_log('Created subscription');
          resolve(subscription.id);
        } else {
          err_log('Error in creating subscription: ' + err);
          reject('Error in creating subscription: ' + err);
        }
      };

      stripe.subscriptions.create(subscription_params, ga_account_params, callback);
    } catch (err) {
      err_log('Payment could not process! Failed with error: ' + err);
      reject('Payment could not process! Failed with error: ' + err);
    }
  });
}

async function createStripeUser(paymentToken, email, uid) {
  if (!uid || !email || !paymentToken) throw new Error('Create Stripe User: Invalid inputs!');
  try {
    const customer = await stripe.customers.create({
      source: paymentToken,
      email: email
    });

    const customer_id = customer.id;
    DB.User_stripeCustId(uid).set(customer_id);
    DB.Stripe_uidForCustomer(customer_id).set(uid);

    return customer_id;
  } catch (e) {
    err_log('Could not create customer! -> ' + e);
    return null;
  }
}

async function deleteUser(uid) {
  return new Promise(async (resolve, reject) => {
    const cust_id = await getStripeCustomerId(uid);

    const callback = async (err, confirmation) => {
      if (confirmation) {
        root.ref('/users/' + uid + '/').set(null);
        root.ref('/queriable/' + uid + '/').set(null);
        root.ref('/stripe_ids/' + cust_id + '/').set(null);

        await admin.auth().deleteUser(uid);
        resolve('Successfully deleted user');
      } else {
        reject('Stripe customer del error: ' + err);
      }
    };

    stripe.customers.del(cust_id, callback);
  });
}

async function initiate_new_user(email, password, usr, paymentToken) {
  return new Promise(async (resolve, reject) => {
    const unclean_user_info = user_info_problems(usr);
    if (unclean_user_info) { reject(unclean_user_info); return; }

    const new_user = new helpers.User(usr.n, email, password, usr.p, usr.dn, usr.j, usr.z);

    if (new_user.PhoneNumber.charAt(0) !== '+' || new_user.PhoneNumber.length === 10) {
      new_user.PhoneNumber = '+1' + new_user.PhoneNumber;
    }

    table_log([new_user]);

    let user_record;
    try {
      user_record = await admin.auth().createUser({
        email: new_user.Email,
        emailVerified: false,
        phoneNumber: new_user.PhoneNumber,
        password: new_user.Password,
        displayName: new_user.DisplayName
      });
    } catch (e) {
      reject('USER_EXISTS');
      return;
    }

    ok_log('created user');
    const uid = user_record.uid;

    // Post user info & handle fail
    if (!postUserInfo(new_user.Name, new_user.Email, new_user.Plan, new_user.DisplayName, new_user.PhoneNumber, uid)) {
      deleteUser(uid);
      err_log('Rejected while posting user info');
      reject('Invalid info');
      return;
    }

    ok_log('posted user info');

    let stripe_user;
    try {
      stripe_user = await createStripeUser(paymentToken, email, uid);
    } catch (e) {
      deleteUser(uid);
      err_log('while creating stripe user -> ' + e);
      reject('Could not create stripe user');
      return;
    }

    ok_log('created stripe user');

    try {
      await executeCreateSubscription(uid, new_user.Plan);
    } catch (e) {
      deleteUser(uid);
      err_log('while initializing payments -> ' + e);
      reject('Could not initialize stripe payments');
      return;
    }

    ok_log('init. payments');
    DB.User_totalDonated(uid).set(0);
    ok_log('init. total donated for uid -> ' + uid);
    ok_log('Completed User Initialization.');

    resolve(uid);
  });
}

const castVote = async (eventId, optionIndex, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ev = await DB.Event_info(eventId).fetch();
      const voteId = Object.keys(ev.o)[optionIndex];

      ok_log('Parsed option index into event option');

      const hasVoted = await userHasAlreadyVoted(eventId, userId);
      if (hasVoted === true) { err_log('User has already voted!'); reject('It seems you have already voted!'); return; }

      ok_log('User hasn\'t voted yet');

      const user_payment_succeeded = await getPrevChargeStatus(userId);
      ok_log('User payment clean');

      DB.Event_votersForOption(eventId, voteId).push(userId);
      DB.User_choiceForEvent(userId, eventId).set(voteId);

      /* Cast vote to the event option */
      let event_option_votes = await DB.Event_optionTotalVotes(eventId, voteId).fetch();
      ok_log('got total option votes -> ' + event_option_votes);
      event_option_votes = Number(event_option_votes) + 1;
      DB.Event_optionTotalVotes(eventId, voteId).set(event_option_votes);
      ok_log('updated total option votes -> ' + event_option_votes);

      /* Update event's total as well */
      let event_total_votes = await DB.Event_overallTotalVotes(eventId).fetch();
      ok_log('got total event votes');
      event_total_votes = Number(event_total_votes) + 1;
      DB.Event_overallTotalVotes(eventId).set(event_total_votes);
      ok_log('updated total event votes');

      ok_log('Casted vote for user -> ' + userId);
      resolve('ok');
    } catch (e) {
      err_log(e);
      reject(e);
    }
  });
};

const update_plan = (idToken, planNameAndAmt, adminOverrideToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      const planId = planIDForNameAndAmt(planNameAndAmt);
      if (!planId) throw new Error('Invalid plan name/amt specified');

      const tkn = adminOverrideToken || await get_decoded_token(idToken);
      if (!tkn) throw new Error('Invalid id token specified');
      const uid = tkn.uid;

      ok_log('update plan status: passed param check');

      const sub_id = await getUserSubscriptionId(uid);
      const subscription = await stripe.subscriptions.retrieve(sub_id);
      ok_log('update plan status: got user sub info -> ' + sub_id);

      const amt = quantityForNameAndAmt(planNameAndAmt);
      ok_log('update plan status: got user amt requested -> ' + amt);

      const params = { cancel_at_period_end: false, items: [{ id: subscription.items.data[0].id, plan: planId, quantity: amt }] };

      const callback = (err, subscription) => {
        if (subscription) {
          ok_log('Got subscription!');
          root.ref('/users/' + uid + '/sub').set(subscription.id);
          root.ref('/users/' + uid + '/i/p/').set(planNameAndAmt);
          root.ref('/queriable/' + uid + '/p').set(planNameAndAmt);
          ok_log('Plan Change complete!');
          resolve(subscription);
          group_end();
        } else {
          err_log('callback err: ' + err);
          reject(err);
          group_end();
        }
      };

      stripe.subscriptions.update(sub_id, params, callback);
    } catch (e) {
      err_log('update plan err: ' + e);
      reject(e);
      group_end();
    }
  });
};

async function cast_texted_vote(user_vote, msg_from) {
  return new Promise(async (resolve, reject) => {
    sms.updateSpamChecker(msg_from);

    const user_id = await sms.idFromNumber(msg_from);
    log('got user id ' + user_id);

    if (user_id !== null) {
      const active_event = await getActiveEventId();
      const voting_options = await sms.getOptionsDispersion();
      log('Got active event & voting options..');

      if (isNaN(user_vote)) {
        reject('User text was not a number');
      } else {
        user_vote = typeof user_vote === 'string' ? parseFloat(user_vote) : Number(user_vote);
        if (voting_options.length > user_vote) {
          const voteId = user_vote - 1;
          log('Got vote id.. casting vote with: \n EventId: ' + active_event + '\n VoteId: ' + voteId + '\n UID: ' + user_id);
          const casted_vote = await castVote(active_event, voteId, user_id);
          ok_log('Casted vote');
          resolve(casted_vote);
        } else {
          reject('User text was not a valid vote index');
        }
      }
    } else {
      reject('User has no phone number');
    }
  });
}

// ____________________________________________________________________________

module.exports = {
  root,
  getWinningOptionForEvent,
  customer_charged_successfully,
  process_charged_customer_info,
  getTotalDonated,
  canPostEvents,
  getUserInfo,
  getPrevChargeStatus,
  getTotalUsersForEvent,
  performMonthlyRollover,
  get_decoded_token,
  getActiveEventId,
  planIDForNameAndAmt,
  user_info_problems,
  postUserInfo,
  initiate_new_user,
  deleteUser,
  createStripeUser,
  executeCreateSubscription,
  getStripeCustomerId,
  getPremiumPlanMostRecent,
  getPremiumPlanTotalCount,
  get_plan_stats,
  get_plan_total_counts,
  getFirebaseUserFromCustomerId,
  castVote,
  update_plan,
  userExists,
  eventSnapshot,
  cast_texted_vote,
  get_most_recent_ev
};

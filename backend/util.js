var moment = require('moment');
var projinfo = require("./ProjectInfo.js");
var plansjs = require("./plans.js");
var logging = require('./logging.js');
var DBLinks = require('./DBLinks.js');
var sms = require('./SMS.js');
var helpers = require('./helpers.js');

let admin = projinfo.admin;
let root = projinfo.root;
let stripe = projinfo.stripe;
let STRIPE_ACCT_ID = projinfo.STRIPE_ACCT_ID;

let PLANS = plansjs.PLANS;
let DB = DBLinks.DB;
var log = logging.log;
var err_log = logging.err_log;
var ok_log = logging.ok_log;
var table_log = logging.table_log;
var group_begin = logging.log_group_begin;
var group_end = logging.log_group_end;
var prettify = logging.prettify;

// ____________________________________________________________________________________________________________________________________________
// ____________________________________________________________________________________________________________________________________________

var get_plan_total_counts       = async ()              => await Promise.all(PLANS.map(async plan =>  ({'title': plan.title, 'users': await DB.Plan_totalCount(plan.title).promiseBoxedFetch() })));
var get_plan_most_recents       = async ()              => await Promise.all(PLANS.map(async plan =>  ({'title': plan.title, 'users': await DB.Plan_mostRecent(plan.title).promiseBoxedFetch() })));
var mostRecentlyAddedEvent      = async ()              => await DB.Event_allEvents().limitedFetchChildren(1);
var getActiveEventId            = async ()              => await DB.Event_active().fetch();
var getStripeCustomerId         = async (uid)           => await DB.User_stripeCustId(uid).fetch()
var canPostEvents               = async (uid)           => await DB.Admin_checkUser(uid).fetch() // may need to check this logic
var getTotalDonated             = async (uid)           => await DB.User_totalDonated(uid).fetch();
var getPrevChargeStatus         = async (uid)           => await DB.User_prevChargeStatus(uid).fetch();
var getUserInfo                 = async (uid)           => await DB.User_info(uid).fetch();
var userExists                  = async (uid)           => {
    try {
        let x = await admin.auth().getUser(uid);
        return x;
    } catch (e) { return null; }
}
var getUserSubscriptionId       = async (uid)           => await DB.User_stripeSubId(uid).fetch();
var eventSnapshot               = async (eventId)       => await DB.Event_info(eventId).fetch()
var getTotalUsersForEvent       = async (eventId)       => await DB.Event_totalUsers(eventId).fetch();
var getTotalIncomeForEvent      = async (eventId)       => await DB.Event_totalDonated(eventId).fetch();
var userHasAlreadyVoted         = async (eid, uid)      => (await DB.User_choiceForEvent(uid, eid).fetch()) !== null;
var getPremiumPlanTotalCount    = async (plan)          => await DB.Plan_totalCount(plan).fetch();
var getPremiumPlanMostRecent    = async (plan)          => await DB.Plan_mostRecent(plan).fetch();
var get_decoded_token           = async (idToken)       => await admin.auth().verifyIdToken(idToken);

var getWinningOptionForEvent = async (active_event_id) => {
    try {
        let options = await eventSnapshot(active_event_id);
        options = options.o;
        // console.log(prettify(options));
        var winner = { votes: null, id: null };

        Object.keys(options).forEach((key) => {
            if (options[key].vrs != null) { // option had voters
                var votes = options[key].ttl;
                if (votes > winner.votes) { // set new winner
                    winner.votes = votes;
                    winner.id = key;
                } else if (votes == winner.votes) {
                    // Randomly determine winner
                    if (Math.random() > 0.5) {
                        winner.votes = votes;
                        winner.id = key;
                    };
                }
            }
        });

        return winner;

    } catch (e) {
        err_log('Get winning opt error: ' + e);
        throw 'Could not get winning option';
        return null;
    }
}

var haveProcessedUserPaymentForEvent = async (uid, eventId) => {
    let event_ref = root.ref('/users/' + uid + '/v/' + eventId + '/don');
    return new Promise( async function (resolve, reject) {
        event_ref.once('value').then(async function(snapshot, err) {
            if (err || !snapshot.val()) {
                resolve('ok');
            } else {
                reject('Already Voted!');
            }
        });
    })
}

var process_charged_customer_info = async (cust_id, amountContributed) => {
    return new Promise(async function(resolve, reject) {
        group_begin('Processing Customer info');

        let uid, active_event, alreadyProcessed, incomeForEvent, totalDonated, totalEventUsers, planTotalCount;
        let p_incomeForEvent, p_totalDonated, p_totalEventUsers, p_planTotalCount;

        /* Phase 1 - Firebase UID from Stripe Customer Id */

        try {   uid = await getFirebaseUserFromCustomerId(cust_id);           } catch (e) { err_log('Could not find firebase user for stripe user!'); reject('Could not find firebase user for stripe user! -> ' + e); group_end(); return null; }

        ok_log(' (1/8) Found uid -> ' + uid);

        /* Phase 2 - Get Active Event */

        try {   active_event = await getActiveEventId();           } catch (e) { err_log(e); reject(e);  group_end(); return null; }

        ok_log(' (2/8) Found active event -> ' + active_event);

        /* Phase 3 - Check that we are not processing an already-processed user */

        let ap_string = 'We have already processed this user! -> ';

        try {  alreadyProcessed = await haveProcessedUserPaymentForEvent(uid, active_event);              } catch (e) { err_log(ap_string + e); reject(e); group_end(); return null; }

        ok_log(' (3/8) we have not yet processed user payment for this month');

        /* Phase 4 - Get total amount the contributed to this event & raise it by the amount the user contributed (parameter) */

        try {   p_incomeForEvent = await getTotalIncomeForEvent(active_event); p_incomeForEvent = Number(p_incomeForEvent);            } catch (e) { err_log(e); reject(e);  group_end();return null; }

        incomeForEvent = p_incomeForEvent + amountContributed;

        ok_log(' (4/8) got and incremented income');

        /* Phase 5 - Get total amount the user has donated & raise it by the amount the user contributed to this specific event (parameter) */

        try {   p_totalDonated = await getTotalDonated(uid); p_totalDonated = Number(p_totalDonated);             } catch (e) { err_log(e); reject(e);  group_end(); return null; }

        totalDonated = p_totalDonated + amountContributed;

        ok_log(' (5/8) got amount donated and incremented -> ' + totalDonated + ' (contributed ' + amountContributed + ')');

        /* Phase 6 - Get and increment the total # of users contributing to this event */

        try {  p_totalEventUsers = await getTotalUsersForEvent(active_event);  p_totalEventUsers =  Number(p_totalEventUsers);            } catch (e) { err_log(e); reject(e);  group_end(); return null; }

        totalEventUsers = p_totalEventUsers+1;

        ok_log(' (6/8) got total event users and incremented -> uid is ' + uid);

        /* Phase 7 - Get user's plan. This is done by first getting their info, then manipulating the string result. */

        try {  user_plan = await getUserInfo(uid); ok_log('got userinfo'); user_plan = user_plan['p'].split(',')[0];                                       } catch (e) { err_log(e); reject(e);  group_end(); return null; }

        ok_log(' (7/8) got user plan -> ' + user_plan);

        /* Phase 8 - Get and increment the total amount that premium users have contributed (to this event, I believe) */

        try {  p_planTotalCount = await getPremiumPlanTotalCount(user_plan); p_planTotalCount = Number(p_planTotalCount);            } catch (e) { err_log(e); reject(e);  group_end(); return null; }

        planTotalCount = p_planTotalCount + 1;

        ok_log(' (8/8) got plan total count -> ' + planTotalCount);

        ok_log('completed db requests');

        let result_json = {
            "uid": uid,
            "active_event": active_event,
            "amountContributed": amountContributed,
            "p_totalDonated": p_totalDonated,
            "totalDonated": totalDonated,
            "p_incomeForEvent": p_incomeForEvent,
            "incomeForEvent": Math.round(incomeForEvent, 3),
            "user_plan": user_plan,
            "p_totalEventUsers": p_totalEventUsers,
            "totalEventUsers": totalEventUsers,
            "p_planTotalCount": p_planTotalCount,
            "planTotalCount": planTotalCount,
            "formatted_time": moment().format('LL'),
        };

        resolve( result_json );
    })
}

var customer_charged_successfully = async (cust_id, amountContributed) => {
    group_begin('customer charged successfully');
    return new Promise(async function(resolve, reject) {
        var processed_info;
        try {
            processed_info = await process_charged_customer_info(cust_id, amountContributed);
            ok_log('processed charged customer info.')
        } catch (e) {
            err_log(e);
            reject("We could not properly process user info. ");
            return;
        }

        if (processed_info == null) { reject("We could not properly process user info. "); return; }

        DB.User_donationForEvent(processed_info.uid,processed_info.active_event).set(amountContributed);

        DB.User_totalDonated(processed_info.uid).set(processed_info.totalDonated);

        DB.Event_totalDonated(processed_info.active_event).set(processed_info.incomeForEvent);

        DB.Event_totalUsers(processed_info.active_event).set(processed_info.totalEventUsers);

        DB.Plan_totalCount(processed_info.user_plan).set(processed_info.planTotalCount);
        DB.Plan_mostRecent(processed_info.user_plan).set(processed_info.formatted_time);
        DB.User_prevChargeStatus(processed_info.uid).set('OK');

        ok_log('Finished processing charge!');
        group_end();

        resolve(processed_info);
        return processed_info;
    })
}

var performMonthlyRollover = () => {
    return new Promise ( async function (resolve, reject) {
        group_begin('Monthly Rollover');
        try {

            log('Payout created');
            let active_event = await getActiveEventId();
            let winningOption = await getWinningOptionForEvent(active_event);

            let ref_string = '/db/events/' + active_event + '/w';

            log('Got options.. now ref string is => ' + ref_string);
            log('winning op was: ' + (winningOption));

            let nextEvent = (await mostRecentlyAddedEvent())[0];

            // console.log(JSON.stringify(nextEvent, null, 3));

            log('Next event id => ' + nextEvent.id + ' (from ' + active_event + ')');

            if (nextEvent.id === active_event) { // nowhere to rollover to
                // PROBLEM: Text Ryan
                sms.send_text_message('9086421391', 'Yo, problem!! There is nowhere for GA to rollover to. Need to add it in via form & call sms.notifyPeople()');
                err_log('Missing a next month to rollover to!');
                resolve('Good');
                return;
            }

            ok_log('Rolling Over');

            root.ref(ref_string).set(winningOption);

            // ------- UPATE WINNING OPTION AS WINNING OPTION ------- //

            root.ref('/db/active_event/').set(nextEvent.id);

            sms.notifyPeople();

            resolve('Good!');
        } catch (e) {

            err_log(e);
            reject(e);
        }
        group_end();
    });
}

var planIDForNameAndAmt = (untrimmed_nameAndAmt) => {
    let plan_title = untrimmed_nameAndAmt.split(',')[0];
    return plansjs.idForPlanWithTitle(plan_title);
}

var quantityForNameAndAmt = (untrimmed_nameAndAmt) => {
    let split = untrimmed_nameAndAmt.split(',');
    let plan_title = split[0];
    let money_being_spent = parseFloat(split[1]);
    if (typeof money_being_spent !== 'number' ) throw 'Quantity error: must be a number';
    let price = plansjs.priceForPlanWithTitle(plan_title) || 1.0; // def is 1.0
    if (price === 1) { // custom
        if (money_being_spent % 1 !== 0) throw 'Quantity error: must be whole number';
        if (money_being_spent < plansjs.lowestPlanCost()) throw 'Quantity error: must be higher than lowest plan.';
    }
    return price !== 1.0 ? 1 : money_being_spent; // they get mbs units if they go custom
}

var getFirebaseUserFromCustomerId = async (cust_id) => {
    let uid = await DB.Stripe_uidForCustomer(cust_id).fetch();
    if (!uid) throw 'Could not find uid';
    return uid;
}

var get_plan_stats = async () => {
    let counts =  await get_plan_total_counts();
    let recents = await get_plan_most_recents();
    return {  counts: counts, recents: recents };
};

var user_info_problems = (userJson) => {

    var check_string = (s, minlen, maxlen) => s && typeof s === 'string' && s.length > minlen && s.length < maxlen;

    // Validate each property
    let nameIsOk = check_string(userJson.n, 3, 50);
    let emailIsOk = check_string(userJson.e, 3,100) && helpers.validateEmail(userJson.e);
    let planIsOk = userJson.p != null && planIDForNameAndAmt(userJson.p) != null;
    let phoneIsOk = userJson.z != null && helpers.validatePhone(userJson.z);
    if (!nameIsOk)  {
        return ('Please check your name, it doesn\'t\n appear to be valid!')
    }  else if (!emailIsOk) {
        return ('Please check your email, it doesn\'t\n appear to be valid!');s
    } else if (!phoneIsOk) {
        return ('Please check your phone number ('+ userJson.z+ '), it doesn\'t\n appear to be valid!')
    } else if (!planIsOk) {
        return ('Please check your plan, it doesn\'t\n appear to be selected!')
    }
    return null;
}

function postUserInfo (n,e,p,dn,z, uid) {

    var userJson = {
        n: n,                           // name
        e: e,                           // email
        p: p,                           // plan
        dn: dn,                         // display name -> I created this earlier, so it's valid.
        j: helpers.getToday(),                  // timestamp
        z: z                            // phone number
    };

    let problems = user_info_problems(userJson);

    if (problems == null) {
        // Set user info
        DB.User_info(uid).set(userJson);
        // set db stuff
        DB.User_totalDonated(uid).set(0);
        return true;
    } else {
        return false;
    }
}

async function executeCreateSubscription (uid, planNameAndAmount) {
    return new Promise(async (resolve, reject) => {

        try {

            let customer_id = await getStripeCustomerId(uid);
            var plan = planIDForNameAndAmt(planNameAndAmount);
            var amt = quantityForNameAndAmt(planNameAndAmount);

            log('Plan: ' + plan + '  Amt: ' + amt);

            let subscription_params = { customer: customer_id, items: [ { plan: plan, quantity: amt } ]};
            let ga_account_params = { stripe_account: STRIPE_ACCT_ID };

            let callback = async (err, subscription) => {
                if (subscription) { // sets should have await..then
                    DB.User_stripeSubId(uid).set(subscription.id);
                    root.ref('/queriable/'+uid+'/p').set(planNameAndAmount);
                    ok_log('Created subscription');
                    resolve(subscription.id);
                } else {
                    err_log('Error in creating subscription: ' + err);
                    throw 'Error in creating subscription: ' + err;
                }
            };
            // Create the user subscription
            stripe.subscriptions.create(subscription_params, ga_account_params, callback);
        } catch (err) {
            err_log('Payment could not process! Failed with error: ' + err);
            reject('Payment could not process! Failed with error: ' + err);
        }
    });
}

async function createStripeUser (paymentToken, email, uid) {
    if (!uid || !email || !paymentToken) throw 'Create Stripe User Err: Invalid inputs!';
    try {
        // Create a Customer:
        const customer = await stripe.customers.create({
            source: paymentToken,
            email: email,
        })

        let customer_id = customer.id;
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

        let cust_id = await getStripeCustomerId(uid);

        let callback = async (err, confirmation) => {
            if (confirmation) {

                // Clear firebase references
                root.ref('/users/' + uid + '/').set(null);
                root.ref('/queriable/' + uid + '/').set(null);
                root.ref('/stripe_ids/' + cust_id + '/').set(null);

                let del = await admin.auth().deleteUser(uid);
                resolve("Successfully deleted user");

            } else {
                reject('Stripe customer del error: ' + err);
            }
        }

        stripe.customers.del(cust_id, callback);

    })
}

async function initiate_new_user (email, password, usr, paymentToken) {
    return new Promise(async function(resolve,  reject)  {

        let unclean_user_info = user_info_problems(usr);
        if (unclean_user_info) { reject(unclean_user_info); return; }

        let new_user = new helpers.User(usr.n,email, password, usr.p, usr.dn, usr.j, usr.z);

        if (new_user.PhoneNumber.charAt(0) != '+' || new_user.PhoneNumber.length == 10)
        new_user.PhoneNumber = '+1' + new_user.PhoneNumber;

        table_log([new_user]);
        var user_record;
        try {
            // create user
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

        let uid = user_record.uid;

        // post user info & handle fail
        if (!postUserInfo(new_user.Name, new_user.Email, new_user.Plan, new_user.DisplayName, new_user.PhoneNumber, uid)) { deleteUser(uid);err_log('Weirdly rejected while posting user info');reject('Invalid info'); return; }

        ok_log('posted user info')

        var stripe_user;
        try { stripe_user = await createStripeUser(paymentToken, email, uid); } catch (e) { deleteUser(uid);err_log('while creating stripe user -> ' + e); reject('Could not create stripe user'); return; }

        ok_log('created stripe user ');

        var init_payments;
        try { init_payments = await executeCreateSubscription(uid, new_user.Plan) } catch (e) { deleteUser(uid);err_log('while initializing payments (creating subscription) -> ' + e); reject('Could not initialize stripe payments'); return; }

        ok_log('init. payments')

        DB.User_totalDonated(uid).set(0);

        ok_log('init. total donated for uid -> ' + uid);

        ok_log('Completed User Initialization.')

        resolve(uid);

    });
}

var castVote = async (eventId, optionIndex, userId) => {
    return new Promise( async function(resolve, reject) {

        try {

            let ev = await DB.Event_info(eventId).fetch();
            let voteId = Object.keys(ev.o)[optionIndex];

            ok_log('Parsed option index into event option');

            let hasVoted = await userHasAlreadyVoted(eventId, userId);
            if (hasVoted == true) { err_log('User has already voted!'); reject('It seens you have already voted!'); return; }
            ok_log('User hasn\'t voted yet')
            let user_payment_succeeded = await getPrevChargeStatus(userId);
            ok_log('User payment clean')

            DB.Event_votersForOption(eventId, voteId).push(userId)
            DB.User_choiceForEvent(userId, eventId).set(voteId);

            ok_log('User payment clean')

            /*  Cast vote to the place  */

            let event_option_votes = await DB.Event_optionTotalVotes(eventId, voteId).fetch();

            ok_log('got total option votes -> ' + event_option_votes)

            event_option_votes = Number(event_option_votes) + 1;
            DB.Event_optionTotalVotes(eventId, voteId).set(event_option_votes);

            ok_log('updated total option votes -> ' + event_option_votes)

            /*  Update event's total as well  */

            let event_total_votes = await DB.Event_overallTotalVotes(eventId).fetch();

            ok_log('got total event votes')

            event_total_votes = Number(event_total_votes);
            event_total_votes++;
            DB.Event_overallTotalVotes(eventId).set(event_total_votes);

            ok_log('updated total event votes')

            ok_log('Casted vote for user -> ' + userId);

            resolve('ok');

        } catch (e) {
            err_log(e);
            reject(e);
        }

    })
}

var update_plan = (idToken, planNameAndAmt, adminOverrideToken ) => {
    return new Promise(async (resolve, reject) => {
        try {

            var planId = planIDForNameAndAmt(planNameAndAmt);
            if (!planId) throw 'Invalid plan name/amt specified';

            // Get decoded token
            let tkn = adminOverrideToken  || await get_decoded_token(idToken);
            if (!tkn) throw 'Invalid id token specified';
            let uid = tkn.uid;

            var sub_id = await getUserSubscriptionId(uid);
            // log(uid + ' -> ' + JSON.stringify(sub_id));
            const subscription = await stripe.subscriptions.retrieve(sub_id);

            let amt = quantityForNameAndAmt(planNameAndAmt);

            let params = { cancel_at_period_end: false, items: [{ id: subscription.items.data[0].id, plan: planId, quantity: amt }] };

            let callback = (err, subscription) => {
                if (subscription) {
                    ok_log('Got subscription!')
                    root.ref('/users/' + uid + '/sub').set(subscription.id);
                    root.ref('/users/' + uid + '/i/p/').set(planNameAndAmt);
                    root.ref('/queriable/' + uid + '/p').set(planNameAndAmt);

                    ok_log('Plan Change complete!')
                    resolve(subscription);
                    group_end();
                } else { err_log(err); reject(err); console.groupEnd(); console.log('\n-- -- \n'); }
            }

            stripe.subscriptions.update(sub_id, params, callback);

        } catch (e) { err_log(e); reject(e); group_end(); }
    })
}


async function cast_texted_vote(user_vote, msg_from) {
    return new Promise(async (resolve, reject) => {
        sms.updateSpamChecker(msg_from);

        let user_id = await sms.idFromNumber(msg_from);
        log('got user id ' + user_id);
        if (user_id !== null) {
            let active_event = await getActiveEventId();
            let voting_options = await sms.getOptionsDispersion();
            log('Got active event & voting options..');

            // check text is a number
            if(isNaN(user_vote)){
                // it's NOT a number
                reject('User text was not a number');
            } else {
                user_vote = typeof user_vote === 'string' ? parseFloat(user_vote) : Number(user_vote);
                //  it's a number
                if (voting_options.length > user_vote)  {
                    // can vote this..  VOTE
                    // let voteId = voting_options[Number(user_vote)-1 /* we give them 1..n not 0..n */ ].id;
                    let voteId = user_vote-1;
                    log('Got vote id.. casting vote with: \n EventId: '+active_event +'\n VoteId: ' + voteId + '\n UID: ' + user_id);
                    let casted_vote = await castVote(active_event,voteId, user_id);
                    ok_log('Casted vote');
                    resolve(casted_vote);

                } else {
                    //can't vote this
                    reject('User text was not a valid vote index');
                }
            }
        } else {
            reject('User has no phone number');
        }
    })
}

// ____________________________________________________________________________________________________________________________________________
// ____________________________________________________________________________________________________________________________________________


module.exports = { root: root, getWinningOptionForEvent: getWinningOptionForEvent, customer_charged_successfully: customer_charged_successfully, process_charged_customer_info: process_charged_customer_info, getTotalDonated: getTotalDonated,
    canPostEvents: canPostEvents,
    getUserInfo: getUserInfo,
    getPrevChargeStatus: getPrevChargeStatus,
    getTotalUsersForEvent: getTotalUsersForEvent,
    performMonthlyRollover: performMonthlyRollover,
    get_decoded_token: get_decoded_token,
    getActiveEventId: getActiveEventId,
    planIDForNameAndAmt: planIDForNameAndAmt,
    user_info_problems: user_info_problems,
    postUserInfo: postUserInfo,
    initiate_new_user: initiate_new_user,
    deleteUser: deleteUser,
    createStripeUser: createStripeUser,
    executeCreateSubscription: executeCreateSubscription,
    getStripeCustomerId: getStripeCustomerId,
    getPremiumPlanMostRecent: getPremiumPlanMostRecent,
    getPremiumPlanTotalCount: getPremiumPlanTotalCount,
    get_plan_stats: get_plan_stats,
    get_plan_total_counts: get_plan_total_counts,
    getFirebaseUserFromCustomerId: getFirebaseUserFromCustomerId,
    castVote: castVote,
    update_plan: update_plan,
    userExists: userExists,
    eventSnapshot: eventSnapshot,
    cast_texted_vote: cast_texted_vote
};

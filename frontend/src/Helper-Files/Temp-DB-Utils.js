import service from './service.js';
import firebase from './firebase.js';
import utils from './utils.js';
import vars, { PLANS } from './variables.js';
import axios from 'axios';
import { events, active_event, users, plans } from '../demo/mockData.js';

/* ─── Demo Mode Data Loading ─────────────────────────────────────────────── */

/**
 * Loads all sensei dashboard data from mockData directly.
 * Used when VITE_DEMO_MODE=true to bypass Firebase/utils and guarantee demo works.
 */
export async function loadSenseiDataForDemo() {
  const uid = 'demo_user_001';
  const userInfo = users[uid]?.i;
  const eventIds = Object.keys(events);
  const activeEvent = events[active_event] || events[eventIds[eventIds.length - 1]];

  const optionKeys = Object.keys(activeEvent?.o || {}).filter((k) => k !== 'ttl');
  let options = optionKeys.map((k, i) => ({
    title: activeEvent.o[k]?.t ?? 'Option ' + (i + 1),
    description: activeEvent.o[k]?.s ?? '',
    id: i
  }));

  if (options.length === 0) {
    options = [
      { title: 'Team Trees', description: 'Planting 20 million trees to restore forests worldwide', id: 0 },
      { title: 'Khan Academy', description: 'Free world-class education for anyone, anywhere', id: 1 },
      { title: 'Water.org', description: 'Safe water and sanitation for families in need', id: 2 }
    ];
  }

  const voteJson = {
    title: 'Vote',
    queried_result: {
      section_title: activeEvent?.t,
      section_summary: activeEvent?.s,
      section_events_info: options,
      voted_callback: voted
    }
  };

  const chartData = eventIds.slice(-5).map((id) => ({
    title: events[id].t,
    total: events[id].ttl
  }));

  const planTotals = PLANS.map((p) => plans[p.title]?.ttl ?? 0);
  const sum = planTotals.reduce((a, b) => a + b, 0) || 1;
  const userData = PLANS.map((p, i) => ({
    amount: p.cost || 'Custom',
    percent_users: Math.round((planTotals[i] / sum) * 10000) / 100
  }));

  const prevEvents = eventIds.slice(-5).map((id) => events[id]);
  const eventData = prevEvents.map((e) => ({
    date: e.t,
    num_users: e.tu,
    total_rev: e.ttl,
    receipt: null
  }));

  const totalDonated = users[uid]?.d?.t ?? 0;
  const planParts = userInfo?.p?.split(',');
  const currentDonation = parseFloat(planParts?.[1] ?? 0);

  return {
    voteJson,
    analyticsData: {
      chart: chartData,
      user: userData,
      prevEvent: eventData,
      total_donated: totalDonated,
      current_donation: currentDonation
    },
    basicInfo: { name: userInfo?.n, email: userInfo?.e }
  };
}

/* ─── Actions ─────────────────────────────────────────────────────────────── */

/** Cast a vote on the current active event */
export const voted = async (on) => {
  const curr_event = await utils.Event_active().fetch();
  const authtoken = await firebase.auth().currentUser.getIdToken(false);

  const body = {
    params: {
      idToken: authtoken,
      eventId: curr_event,
      voteId: on
    }
  };

  console.log('Casting vote: EID: ' + body.params.eventId + ', Option: ' + body.params.voteId);

  try {
    await axios.post(vars.server_urls.castVote, body);
    alert('Submitted vote!');
    return 'Submitted vote!';
  } catch (error) {
    if (error.response) {
      console.log('Issue voting -> ' + error.response.data);
      alert('Couldn\'t Submit Vote. ' + error.response.data);
    }
  }
};

/** Update user's name and/or email */
export const changedInfo = async (name, email) => {
  return new Promise(async (res, rej) => {
    const uid = firebase?.auth()?.currentUser?.uid;
    if (!uid) { console.log('No user logged in.'); return; }

    let updated_name = false;
    if (name) {
      await utils.User_info(uid).setChild('n', name);
      updated_name = true;
    }
    if (email) {
      try {
        await firebase.auth().currentUser.updateEmail(email);
        await utils.User_info(uid).setChild('e', email);
      } catch (e) {
        rej(updated_name ? 'Updated name successfully, but not email. ' + e.message : e.message);
        return;
      }
    }
    if (name || email) res('Information updated.');
    else res('Information is already updated');
  });
};

/** Submit new payment info */
export const newPaymentInfoSubmitted = async (paymentToken) => {
  const authtoken = await firebase.auth().currentUser.getIdToken(false);
  return await axios.post(vars.server_urls.changePaymentSource, { tokenId: authtoken, paymentToken });
};

/** Submit a plan change */
export const newPlanSubmitted = async (plan) => {
  const authtoken = await firebase.auth().currentUser.getIdToken(false);
  return await axios.post(vars.server_urls.change_plan, { idToken: authtoken, plan });
};

/** Delete user account */
export const deleteUserAccount = async () => {
  const authtoken = await firebase.auth().currentUser.getIdToken(false);
  await axios.post(vars.server_urls.deleteUser, { idToken: authtoken });
  await logout();
};

/** Login with email and password */
export const login = async (email, pass) => {
  const user = await firebase.auth().signInWithEmailAndPassword(email, pass);
  service.triggerEvent('User', user);
  return user;
};

/** Get basic user info (name, email) */
export const userBasicInfo = async () => {
  const uid = firebase?.auth()?.currentUser?.uid;
  if (!uid) { console.log('No user logged in.'); return; }
  const info = await utils.User_info(uid).fetch();
  return { name: info.n, email: info.e };
};

/** Sign up a new user */
export const signup = async (name, email, password, phone, plan, payToken) => {
  try {
    return await axios.post(vars.server_urls.initiate_new_user, {
      params: { n: name, e: email, p: plan, z: phone, pw: password, paymentToken: payToken }
    });
  } catch (e) {
    console.log('Found signup error: ' + (e?.response?.data?.message || e.toString()));
    throw new Error('Signup Error.');
  }
};

/** Logout */
export const logout = async () => {
  await firebase.auth().signOut();
  service.triggerEvent('User', null);
  return 'logged out';
};

/* ─── Data Fetching ───────────────────────────────────────────────────────── */

/** Get the current voting event JSON */
export async function getVoteJSON() {
  const curr_event_id = await utils.Event_active().fetch();
  const info = await utils.Event_info(curr_event_id).fetch();

  const options = Object.keys(info.o)
    .map((choice, index) => ({ title: info.o[choice].t, description: info.o[choice].s, id: index }))
    .filter((_, i, arr) => i < arr.length - 1); // Remove the 'ttl' key

  return {
    title: 'Vote',
    queried_result: {
      section_title: info.t,
      section_summary: info.s,
      section_events_info: options,
      voted_callback: voted
    }
  };
}

/** Get chart data for analytics */
export async function getChartData() {
  return (await utils.Event_allEvents().limitedFetchChildren(5)).map((event) => ({
    title: event.t,
    total: event.ttl
  }));
}

/** Get user distribution data across plans */
export async function getUserData() {
  const ttl_data = await Promise.all(
    PLANS.map(async (plan) => ({
      amount: plan.cost || 'Custom',
      users: await utils.Plan_totalCount(plan.title).promiseBoxedFetch()
    }))
  );

  let sum = 0;
  ttl_data.forEach((row) => { sum += row.users; });

  return ttl_data.map((row) => ({
    amount: row.amount,
    percent_users: round(row.users / sum, 2) * 100
  }));
}

/** Get previous event data for history */
export async function getPrevEventData() {
  const events = await utils.Event_allEvents().limitedFetchChildren(5);
  const receipts = await Promise.all(
    events.map(async ({ id }) => await utils.Receipt_forEvent(id).fetch())
  );
  return events.map((event, index) => ({
    date: event.t,
    num_users: event.tu,
    total_rev: event.ttl,
    receipt: receipts[index]
  }));
}

/** Get total donated by current user */
export async function getTotalDonated() {
  const uid = firebase.auth().currentUser?.uid;
  return utils.User_totalDonated(uid).fetch();
}

/** Get current user's donation amount */
export async function getCurrentDonation() {
  const uid = firebase?.auth()?.currentUser?.uid;
  const uinfo = await utils.User_info(uid).fetch();
  const plan_parts = uinfo.p?.split(',');
  return parseFloat(plan_parts ? plan_parts[1] : 0);
}

/** Get current Firebase auth user */
export async function getUserInfo() {
  return firebase?.auth()?.currentUser;
}

/* ─── Persistence & Auth Listener ─────────────────────────────────────────── */

export const establishPersistence = async () => {
  try {
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    console.log('Established local data persistence.');
  } catch (e) {
    console.error('Issue establishing persistence');
  }
};

export const setupFirebaseUserListener = () => {
  firebase.auth().onAuthStateChanged((user) => service.triggerEvent('User', user));
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

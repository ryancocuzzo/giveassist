import firebase from './firebase.js';
import axios from 'axios';
import vars from './variables.js';
import DB from './utils.js';

const server_urls = vars.server_urls;

/** Gets the active event id */
export const getActiveEventId = async () => DB.Event_active().fetch();

export const get_all_EventIdAndName_sets = async () => {
  const ref = firebase.database().ref('/db/events');
  return new Promise((resolve, reject) => {
    ref.once('value').then((snapshot, err) => {
      if (err) { console.log(err); reject(err.message); return; }
      const events = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val != null && val['t'] != null && val['t'] !== '') {
          events.push({ event_id: child.key, title: val['t'] });
        }
      });
      resolve(events);
    });
  });
};

export const mostRecentlyAddedEvent = async () => {
  return new Promise((resolve, reject) => {
    const events_ref = firebase.database().ref('/db/events/').limitToLast(1);
    events_ref.once('value').then((snap) => {
      if (snap && snap.val()) resolve(snap.val());
      else reject('Could not load events');
    });
  });
};

export const get_receipts_count = async () => {
  return new Promise((resolve) => {
    const receipts_ref = firebase.database().ref('/receipts/total');
    receipts_ref.once('value').then((snap) => {
      if (snap && snap.val()) resolve(Number(snap.val()));
      else resolve(0);
    });
  });
};

export const get_users = async () => {
  return new Promise((resolve, reject) => {
    const events_ref = firebase.database().ref('/queriable/');
    events_ref.once('value').then((snap) => {
      if (snap && snap.val()) resolve(snap.val());
      else reject('No users found');
    });
  });
};

export const get_n_events = async (n) => {
  return new Promise((resolve, reject) => {
    const events_ref = firebase.database().ref('/db/events/').limitToLast(n);
    events_ref.once('value').then((snap) => {
      if (snap && snap.val()) resolve(convert_to_iterable_object(snap.val()));
      else reject('No events found');
    });
  });
};

/** User votes */
export const userVotes = async (userId) => {
  const ref = firebase.database().ref('/users/' + userId + '/v/');
  return new Promise((resolve, reject) => {
    ref.once('value').then((snapshot, err) => {
      if (err) { console.log(err); reject(err.message); return; }
      const events_voted_on = [];
      snapshot.forEach((child) => {
        if (child.val()['c'] != null && child.val()['c'] !== '') {
          events_voted_on.push(child.key);
        }
      });
      resolve(events_voted_on);
    });
  });
};

/** User donations */
export const userDonations = async (userId) => {
  const ref = firebase.database().ref('/users/' + userId + '/v/');
  return new Promise((resolve, reject) => {
    ref.once('value').then((snapshot, err) => {
      if (err) { console.log(err); reject(err.message); return; }
      const events_donated_on = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val != null && val['don'] != null && val['don'] !== '') {
          events_donated_on.push({ event_id: child.key, don: val['don'] });
        }
      });
      resolve(events_donated_on);
    });
  });
};

export const getUserInfo = async (uid) => {
  return new Promise((resolve, reject) => {
    const ref = firebase.database().ref('/users/' + uid + '/i/');
    ref.once('value').then((snap) => {
      if (snap && snap.val()) resolve(snap.val());
      else reject('Could not load user info');
    });
  });
};

export const getTotalDonated = async (uid) => {
  const event_ref = firebase.database().ref('/users/' + uid + '/d/t');
  return new Promise((resolve, reject) => {
    event_ref.once('value').then((snapshot) => {
      resolve(Number(snapshot.val()));
    }).catch((err) => {
      reject(err.message);
    });
  });
};

/**
 * Returns event info with vote dispersion:
 * { info, total_votes, option_dispersion }
 */
export const eventInfo = async (eventId) => {
  const event_ref = firebase.database().ref('/db/events/' + eventId);
  return new Promise((resolve, reject) => {
    event_ref.once('value').then((snapshot) => {
      const event = snapshot.val();
      if (event == null) { reject('Could not unpack event!'); return; }

      const e = {
        title: event['t'],
        summary: event['s'],
        options: event['o'],
        id: event['id'],
        num_users: event['tu'],
        total_revenue: event['ttl']
      };

      let total = 0;
      const dispersionArray = [];

      Object.keys(e.options).forEach((key) => {
        if (e.options[key].t != null) {
          const opt = {
            id: key,
            title: e.options[key].t,
            votes: e.options[key].ttl,
            description: e.options[key].s,
            org: e.options[key].org
          };
          total += opt.votes;
          dispersionArray.push(opt);
        }
      });

      resolve({
        info: e,
        total_votes: total,
        option_dispersion: dispersionArray
      });
    });
  });
};

export const castVote = async (eventId, voteId, token) => {
  return new Promise((resolve, reject) => {
    axios.get(server_urls.castVote, { params: { eventId, idToken: token, voteId } })
      .then(() => { resolve(true); })
      .catch((e) => { reject(e); });
  });
};

/* Helper Functions */

const convert_to_iterable_object = (jsonObject) => {
  const objArray = [];
  if (jsonObject) {
    Object.keys(jsonObject).forEach((key) => {
      objArray.push({ key, value: jsonObject[key] });
    });
  }
  return objArray;
};

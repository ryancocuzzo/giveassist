
import firebase, { auth, provider } from '../Helper-Files/firebase.js';
import axios from 'axios';
import vars from '../Helper-Files/variables.js';
import moment from 'moment';
import DBLinks from '../Helper-Files/utils.js';
var server_urls = vars.server_urls;

/* Indepedent functions */

/**
 * Gets the active event id
 * @return {[String]} the active event id
 */
export const getActiveEventId = async () => {

  let event_ref = firebase.database().ref('/db/active_event');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot) {
      resolve(snapshot.val());
    }).catch(function(err) {
      reject(err.message);
    });
  })

}

export const get_all_EventIdAndName_sets = async () => {
    let ref = firebase.database().ref('/db/events')
    return new Promise( function (resolve, reject) {
      ref.once('value').then(function(snapshot, err) {
        if (err) { console.log(err); reject(err.message); } else {
          var events = [];
          snapshot.forEach(function(child) {
            let val = child.val();
            if (val != null && val['t'] != null && val['t'] != '') {
              let event = child.key;
              let option = val;

              let ev = {
                event_id: event,
                title:  val['t']
              }

              events.push(ev);
            }
          })
          resolve(events);
        }
      });
    })
}

export const mostRecentlyAddedEvent = async () => {
  return new Promise ( function(resolve, reject) {
    var events_ref = firebase.database().ref('/db/events/').limitToLast(1);
    events_ref.once('value').then (function(snap) {
        console.log('Snapback & unload');
        if (snap && snap.val())
            resolve(snap.val())
        else
            reject('Ay carumba!!!')
    })
  })
}

export const get_reciepts_count = async () => {
  return new Promise ( function(resolve, reject) {
    var receipts_ref = firebase.database().ref('/reciepts/total');
    receipts_ref.once('value').then (function(snap) {
        console.log('Snapback & unload');
        if (snap && snap.val())
            resolve(Number(snap.val()))
        else
            resolve(0);
    })
  })
}

export const get_users = async () => {
  return new Promise ( function(resolve, reject) {
    var events_ref = firebase.database().ref('/queriable/');
    events_ref.once('value').then (function(snap) {
        console.log('Snapback & unload');
        if (snap && snap.val())
            resolve(snap.val())
        else
            reject('Ay carumba!!!')
    })
  })
}

export const get_n_events = async (n) => {
  return new Promise ( function(resolve, reject) {
    var events_ref = firebase.database().ref('/db/events/').limitToLast(n);
    events_ref.once('value').then (function(snap) {
        console.log('Snapback & unload');
        if (snap && snap.val())
            resolve(convert_to_iterable_object(snap.val()))
        else
            reject('Ay carumba!!!')
    })
  })
}

/* User */

export const userVotes = async (userId) => {
  console.log('userVotes: ');
    let ref = firebase.database().ref('/users/' + userId + '/v/')
    return new Promise( function (resolve, reject) {
      ref.once('value').then(function(snapshot, err) {
        if (err) {
          console.log(err);
          reject(err.message);
      } else {

          var events_voted_on = [];
          snapshot.forEach(function(child) {
            if (child.val()['c'] != null && child.val()['c'] != '') {
              let event = child.key;
              let option = child.val();

              events_voted_on.push(event);
            }
          })
          resolve(events_voted_on);
        }
      });
    })
}

export const userDonations = async (userId) => {
    let ref = firebase.database().ref('/users/' + userId + '/v/')
    return new Promise( function (resolve, reject) {
      ref.once('value').then(function(snapshot, err) {
        if (err) { console.log(err); reject(err.message); } else {
          var events_donated_on = [];
          snapshot.forEach(function(child) {
            let val = child.val();
            if (val != null && val['don'] != null && val['don'] != '') {
              let event = child.key;
              let option = val;

              let donation = {
                event_id: event,
                don:  val['don']
              }

              events_donated_on.push(donation);
            }
          })
          resolve(events_donated_on);
        }
      });
    })
}

export const getUserInfo = async (uid) => {
    return new Promise( function(resolve, reject) {
      let ref = firebase.database().ref('/users/' + uid + '/i/');

        ref.once('value').then (function(snap) {
            console.log('Snapback & unload');
            if (snap && snap.val())
                resolve(snap.val())
            else
                reject('No profilie pic!')
        })
    })
}
/**
 * Gets the active event id
 * @return {[String]} the active event id
 */
export const getTotalDonated = async (uid) => {

  let event_ref = firebase.database().ref('/users/' + uid + '/d/t');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot) {
      resolve(Number(snapshot.val()));
    }).catch(function(err) {
      reject(err.message);
    });
  })

}

/* Event */


/**
 * Returns the following json for an event:
 *   {
         total_vote : # of votes the event got,
         option_dispersion: Each option with its id, its title, & its # of votes
     }
 *
 * @param  {[String]} eventId [event id]
 * @return {[Object]} snapshot
 */
export const eventInfo = async (eventId) => {

  // ref
  let event_ref = firebase.database().ref('/db/events/' + eventId);

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot, err) {
      if (err) {
        console.log(err);
        reject(err.message);
        return;
      }

      let event = snapshot.val();
      if (event == null) { reject('Could not unpack event!'); }
      var e = {
            title: event["t"],
            summary: event["s"],
            options: event["o"],
            id: event['id'],
            num_users: event['tu'],
            total_revenue: event['ttl']
      }

      var total = 0;
      var dispersionArray = [];

      Object.keys(e.options).forEach(function(key) {
        if (e.options[key].t != null) {
          var opt = {
              id: key,
              title: e.options[key].t,
              votes: e.options[key].ttl,
              description: e.options[key].s,
              org: e.options[key].org,
          }
          total += opt.votes;
           dispersionArray.push(opt);
        }
      });

      let result_json = {
          'info': e,
          "total_votes": total,
          "option_dispersion": dispersionArray
      }

      resolve(result_json)

    });
  })
}

export const castVote = async (eventId, voteId, token) => {
  return new Promise( function(resolve, reject) {
    axios.get(server_urls.castVote, {params: {eventId: eventId, idToken: token, voteId: voteId}}).then( function(response) {
      resolve(true);
    }).catch(function(e) {
      reject(e);
    })
  })
}





/*

    Helper Functions

 */

 var convert_to_iterable_object = (jsonObject) => {

     var objArray = [];

     if (jsonObject) {

       Object.keys(jsonObject).forEach(function(key) {
         var temp = {}
         temp.key = key;
         temp.value = jsonObject[key];
         objArray.push(temp);
       });

     }

     return objArray;
   }

   var getKey = () => {
     return firebase.database().ref().push().key;
   }

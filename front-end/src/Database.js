
import firebase, { auth, provider } from './firebase.js';
import Gen from 'firebase-auto-ids';
import axios from 'axios';
import vars from './variables.js';

var server_urls = vars.server_urls;

/**
 * Gets the snapshot for an event
 * @param  {[String]} eventId [event id]
 * @return {[Object]} snapshot
 */
export const eventSnapshot = async (eventId) => {

  // ref
  let event_ref = firebase.database().ref('/db/events/' + eventId);

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot, err) {
      if (err) {
        console.log("Potential Error?? function: voteSnapshot. ");
        console.log(err);
        reject(err.message);
    } else {
        if (snapshot.val()) {
          let event = snapshot.val();
          event['id'] = eventId;
          resolve(event)
        } else {
          resolve(snapshot.val());
        }


      }
    });
  })
}

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


/**
 * Gets the total votes for a certain vote id
 * @param  {[String]} voteId [vote id]
 * @return {[Integer]}  [number of votes]
 */
export const votersFor = async (eventId, voteId) => {

  let event_ref = firebase.database().ref('/db/events/'+eventId+'options'+voteId+'voters');

  return new Promise( function (resolve, reject) {
    event_ref.once('value').then(function(snapshot, err) {
      if (err) {
        console.log("Potential Error?? function: votersFor. ");
        console.log(err);
        reject(err.message);
      } else {
        resolve(snapshot.val());
      }
    });
  })
}

export const createEvent = async (title, summary, options, idToken) => {
    let event = {
      title: title,
      summary: summary,
      options: JSON.parse(JSON.stringify(options))
    };
    console.log("Sending createEvent post with params: \nEvent: \n" + event + "idToken: " + idToken)
    axios.post(server_urls.createEvent, {params: {event: event, idToken: idToken}}).then( function(response) {
      let created = response.data;
      let msg = created ? "Event created!" : "Event could not be created!";
      alert(msg);
    })
}

export const getEventPriveledges = async (idToken) => {
    axios.post(server_urls.eventPriviledges, {params: {idToken: idToken}}).then( function(response) {
      let created = response.data;
      let msg = created ? "Event created!" : "Event could not be created!";
      alert(msg);
    })
}

export const getOptions = (titles, summaries) => {

  var obj = [];
  for (var i = 0; i < titles.length; i++) {
    var temp = {
      title: titles[i],
      summary: summaries[i]
    };
    obj.push(temp)
  }

  var js = {};

  obj.map(function(o) {

    var key = getKey();

    js[key] = {
      title: o.title,
      summary: o.summary
    };
  })
  return js;
}

export const userVotes = async (userId) => {
  console.log('userVotes: ');
    let ref = firebase.database().ref('/users/' + userId + '/votes/')
    return new Promise( function (resolve, reject) {
      ref.once('value').then(function(snapshot, err) {
        if (err) {
          console.log(err);
          reject(err.message);
      } else {

          var events_voted_on = [];
          snapshot.forEach(function(child) {
            if (child.val()['chosen_option'] != null && child.val()['chosen_option'] != '') {
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

export const getKey = () => {
  return firebase.database().ref().push().key;
}

export const castVote = (eventId, voteId, userId) => {

    firebase.database().ref('/db/events/' + eventId + '/options/' + voteId+'/voters/').push(userId)
    firebase.database().ref('/users/' + userId + '/votes/' + eventId + '/chosen_option').set(voteId);
}

export const getProfilePictureFilename = async (uid) => {
    return new Promise( function(resolve, reject) {
      let ref = firebase.database().ref('/users/' + uid + '/images/profilePicture');

        ref.once('value').then (function(snap) {
            console.log('Snapback & unload');
            if (snap && snap.val())
                resolve(snap.val())
            else
                reject('No profilie pic!')
        })
    })
}

export const getUserInfo = async (uid) => {
    return new Promise( function(resolve, reject) {
      let ref = firebase.database().ref('/users/' + uid + '/info/');

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

  let event_ref = firebase.database().ref('/users/' + uid + '/donation_stats/total_donated');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot) {
      resolve(snapshot.val());
    }).catch(function(err) {
      reject(err.message);
    });
  })

}

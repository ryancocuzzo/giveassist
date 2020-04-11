import firebase, { auth, provider } from '../Helper-Files/firebase.js';

class Link {
  constructor(base_ref, single_val) {
    this.base_ref = base_ref;
    this.single_val = single_val;
    }

  shortRef() { return this.base_ref;  }
  longRef() { return this.single_val ? this.base_ref.child(this.single_val) : this.base_ref;  }
  async fetch (){
    let b = this.base_ref;
    let self = this;
    return new Promise ( function(resolve, reject) {
    b.once('value').then (function(snap) {
          if (snap && snap.val()) {
            if (self.single_val)
              resolve(snap.val()[self.single_val])
            else
            resolve(snap.val())
          }
          else
              reject('No snapshot value found for ref ' + b)
      }).catch(function(err) { reject(err) })
    })
  }
  async setValue(to) { this.longRef().set(to); }
  async pushValue(val) { this.longRef().push(val); }
}

let DBLinks = {
  totalDonated: function (uid) { return new Link( firebase.database().ref('/users/' + uid + '/d'), 't'); },
  eventTotalUsers:  function (eventId) { return new Link( firebase.database().ref('/db/events/' + eventId), 'tu'); },
  prevChargeStatus: function (uid){ return new Link( firebase.database().ref('/users/' + uid + '/st'), 'pcs'); },
  eventVoters: function(eventId, voteId) { return new Link( firebase.database().ref('/db/events/' + eventId + '/o/' + voteId+'/vrs/'), null); },
  userVoteChoice: function(userid, eventId) { return new Link( firebase.database().ref('/users/' + userid + '/v/' + eventId), 'c'); },
  eventOptionTotalVotes: function(eventId, voteId) { return new Link(firebase.database().ref('/db/events/' + eventId + '/o/' + voteId), 'ttl'); },// remove ttl
  eventOverallTotalVotes: function(eventId) { return  new Link(firebase.database().ref('/db/events/'+eventId+'/o'), 'ttl'); },  //  remove ttl
  planTotalCount: function(plan) { return  new Link(firebase.database().ref('/db/plans/'+plan), 'ttl') },
  planMostRecent: function(plan) { return  new Link(firebase.database().ref('/db/plans/'+plan), 'mr') }, // remove mr
  userInfo: function (uid){ return new Link( firebase.database().ref('/users/' + uid + '/i')) },
  eventTotalDonated: function (eventId){ return new Link( firebase.database().ref('/db/events/' + eventId + '/ttl/') ) },
  userDonation: function (uid, eventId){ return new Link( firebase.database().ref('/users/' + uid + '/v/'+eventId+"/don")) },
  userDonationEventList: function (userId){ return new Link( firebase.database().ref('/users/' + userId + '/v/')) }
}

export default DBLinks;

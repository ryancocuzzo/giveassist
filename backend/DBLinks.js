let projinfo = require("./ProjectInfo.js");
let admin = projinfo.admin;
let root = projinfo.root;
class Link {
  constructor(base_ref, single_val) {
    this.base_ref = root.ref(base_ref);
    this.single_val = single_val;
  }

  shortRef() { return this.base_ref;  }
  longRef() { return this.single_val ? this.base_ref.child(this.single_val) : this.base_ref;  }

  async fetch(){
    let snap = await this.longRef().once('value')//.val();
    let val = (this.single_val && snap) ? snap[this.single_val].val() : snap.val();
    // console.log('fetched ' + JSON.stringify(val) + 'for long ref ' + this.longRef());
    return val;
  }

  /* USE CASE: data not arriving when it should? try this */
  async promiseBoxedFetch(){
    let snap = await this.longRef().once('value')//.val();
    let val = (this.single_val && snap) ? snap[this.single_val].val() : snap.val();
    // console.log('fetched ' + JSON.stringify(val) + 'for long ref ' + this.longRef());
    return Promise.resolve(val);
  }

  async fetchChildren(){
    let snap = await this.longRef().once('value');
    var children = [];
    snap.forEach((child) => { children.push(child.val()); })
    return children;
  }

  async limitedFetch(n_results) {
    let snap = await this.longRef().limitToLast(n_results).once('value')//?.val();
    return this.single_val && snap ? snap[this.single_val] : snap;
  }

  async limitedFetchChildren(n_results){
    let snap = await this.longRef().limitToLast(n_results).once('value');
    var children = [];
    snap.forEach((child) => { children.push(child.val()); })
    return children;
  }
  async set(to) { this.longRef().set(to); }
  async push(val) { this.longRef().push(val); }
}

var DBLinky =(path, val) => new Link(path, val);

let UserLink =(uid, path) => DBLinky('/users/' + uid + path);
let EventLink =(eid, path) => DBLinky('/db/events/' + eid + path);
let PlanLink =(plan, path) => DBLinky('/db/plans/' + plan + path);
let UserEventLink =(uid, eid, path) => DBLinky('/users/' + uid + '/v/' + eid + path);
let ReceiptLink =(path)   => DBLinky('/reciepts/' + path);
let StripeLink  = (path) => DBLinky('/stripe_ids/' + path);
let AdminLink  = (uid, path) => DBLinky('/admins/' + uid +  path);

let DB = {

    User_totalDonated:       (uid) =>         UserLink(uid, '/d/t'),
    User_prevChargeStatus:   (uid) =>         UserLink(uid, '/st/pcs'),
    User_donationEventList:  (uid) =>         UserLink(uid, '/v'),
    User_info:               (uid) =>         UserLink(uid, '/i'),
    User_stripeCustId:       (uid) =>         UserLink(uid, '/st/id'),
    User_stripeSubId:        (uid) =>         UserLink(uid, "/st/sub"),
    User_donationForEvent:   (uid, eid) =>    UserEventLink(uid, eid, "/don"),
    User_choiceForEvent:     (uid, eid) =>    UserEventLink(uid, eid, "/x"),

    Event_active:            () =>            DBLinky('/db/active_event'),
    Event_allEvents:         () =>            EventLink('',''),
    Event_totalDonated:      (eid) =>         EventLink(eid, '/ttl'),
    Event_info:              (eid) =>         EventLink(eid, ''),
    Event_totalUsers:        (eid) =>         EventLink(eid, '/tu'),
    Event_used:              (eid) =>         EventLink(eid, '/used'),
    Event_overallTotalVotes: (eid) =>         EventLink(eid, '/o/ttl'),
    Event_votersForOption:   (eid, optid) =>  EventLink(eid, '/o/' + optid +'/vrs/'),
    Event_optionTotalVotes:  (eid, optid) =>  EventLink(eid, '/o/' + optid + '/ttl'),

    Plan_totalCount:         (plan) =>        PlanLink(plan, '/ttl') ,
    Plan_allPlanInfo:        () =>            PlanLink('', '') ,
    Plan_mostRecent:         (plan) =>        PlanLink(plan, '/mr'),

    Reciept_forEvent:        (eid) =>         ReceiptLink(eid),
    Reciept_total:           () =>            ReceiptLink(''),

    Stripe_uidForCustomer:  (cust_id) =>     StripeLink(cust_id,'/uid/'),

    Admin_checkUser:         (uid) =>        AdminLink(uid, '')
};

module.exports = {
    DB: DB
}

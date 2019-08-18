var admin = require("firebase-admin");
var prod_serviceAccountKey = require("./prod_serviceAccountKey");
var dev_serviceAccountKey = require("./dev_serviceAccountKey");
var clc = require("cli-color");

String.prototype.replaceAll = function(search, replacement) {
  var target = this + '';
  return target.split(search).join(replacement);
};

var production_app = {
  credential: admin.credential.cert(prod_serviceAccountKey),
  databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
  storageBucket: "donate-rcocuzzo-17387568.appspot.com"
}

var dev_sandbox_app = {
    credential: admin.credential.cert(dev_serviceAccountKey),
    databaseURL: "https://giveassist-inc-dev-sandbox.firebaseio.com"
};

const accountSid = '[REDACTED]';
const authToken = '[REDACTED]';
const client = require('twilio')(accountSid, authToken);
const twilio_phoneNumber = '+19083049973';


let TEST_MODE = false;

var stripe;

if (TEST_MODE == true) { 
  stripe = require("stripe")("[REDACTED]");
  admin.initializeApp(dev_sandbox_app);
 } else { 
   stripe = require("stripe")("[REDACTED]");
   admin.initializeApp(production_app);
}

// /*
//   TEST: [REDACTED]
//   LIVE: [REDACTED]
// */
// // var stripe = require("stripe")("[REDACTED]"); // test
// var stripe = require("stripe")("[REDACTED]"); // live                                                                                                                                                                                                                                          
// Get a reference to the root of the Database
var root = admin.database();

let PRICE_PREM_X = 4.99;
let PRICE_PREM_Y = 2.99;
let PRICE_PREM_Z = 1.00;

// ____________________________________________________________________________________________________________________________________________
// ____________________________________________________________________________________________________________________________________________

function log(output) {
  console.log(output)
}
function logn(output) {
  console.log('\n' + output)
}


function err_log(output) {
  logn(clc.red.bold('Error ') + output);
}

function ok_log(output) {
  logn(clc.green.bold('OK ') + output);
}

function table_log(output)  {
  console.table(output);
}

function log_group_begin(text) {console.group('\n-- -- ' + text + ' -- --\n');}

function log_group_end() { console.groupEnd(); console.log('\n-- -- \n'); }

function User(name, email, password, plan, displayName, joined,  phoneNumber) {
  this.Name = name;
  this.Email = email;
  this.Password = password;
  this.Plan = plan;
  this.DisplayName = displayName;
  this.Joined = joined;
  this.PhoneNumber = phoneNumber;
}

randomSnippet = () => {
  var length = 3;
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
  }

rNumber = () => {
  var length = 3;
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
  }

  var extractPhoneNumber = (uncleaned) => {
    var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
    return cleaned;
  }
  
  var comparePhoneNumbers  = (a, b) => {
    var same_10 = (extractPhoneNumber(a).slice(-10) == extractPhoneNumber(b).slice(-10));
    return same_10; // no country compare yet
  }



var getProfilePictureFilename = async (uid) => {
  return new Promise( function(resolve, reject) {
      root.ref('/users/' + uid + '/img/p').once('value').then (function(snap) {
          if (snap && snap.val())
              resolve(snap.val())
          else
              reject('No stripe customer id!')
      })
  })
}




/**
 * Gets the active event id
 * @return {[String]} the active event id
 */
var getTotalIncomeForEvent = async (eventId) => {

  let event_ref = root.ref('/db/events/' + eventId + '/ttl');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot) {
      resolve(snapshot.val());
    }).catch(function(err) {
      reject(err.message);
    });
  })

}

var getStripeCustomerId = async (uid) => {
  return new Promise( function(resolve, reject) {
      root.ref('/users/' + uid + '/st/id').once('value').then (function(snap) {
          if (snap && snap.val())
              resolve(snap.val())
          else
              reject('No stripe customer id!')
      })
  })
}


function make_test_event() {
    return {
        "id" : "-LUZFB34" + randstring(10),
        "o" : {
          "a" : {
            "link" : "https://" +randstring(10) + '.com',
            "org" : "Random org",
            "s" : randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "b" : {
            "link" : "https://" +randstring(10) + '.com',
            "org" : "Random org",
            "s" : randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "c" : {
            "link" : "https://" +randstring(10) + '.com',
            "org" : "Random org",
            "s" : randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "ttl" : 0
        },
        "s" : randstring(100),
        "t" : "Test 2019",
        "ttl" : 0,
        "tu" : 999
    }
}


var getStripeCustomerId = async (uid) => {
  return new Promise( function(resolve, reject) {
      root.ref('/users/' + uid + '/st/id').once('value').then (function(snap) {
          if (snap && snap.val())
              resolve(snap.val())
          else
              reject('No stripe customer id!')
      })
  })
}


var getWinningOptionForEvent = async (active_event_id) => {
  return new Promise ( async function(resolve, reject) {
   try {
       let snap = await eventSnapshot(active_event_id);
       log('got snap');
       let event = {
          title: snap["t"],
          summary: snap["s"],
          options: snap["o"],
          id: snap['id']
        }
    
        var winner = {
            votes: null,
            id: null
        };
        if (event) {

            Object.keys(event.options).forEach(function(key) {
                if (event.options[key].vrs != null) { // option had voters
                  var votes = event.options[key].ttl;
                  if (votes > winner.votes) {
                      log('setting winner to ' + key + ' at ' + votes + ' votes'); 
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
        }
       
       resolve(winner);
    
   } catch (e) {
       reject(e);
   }      
  })
}


/**
 * Gets the snapshot for an event
 * @param  {[String]} eventId [event id]
 * @return {[Object]} snapshot
 */
var eventSnapshot = async (eventId) => {

  // ref
  let event_ref = root.ref('/db/events/' + eventId);

  return new Promise( async function (resolve, reject) {

    event_ref.once('value').then( async function(snapshot, err) {
      if (err) {
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


function send_text_message(pn, body) {
  if (pn == null) { log('Warning: Could not send text to empty number!'); return; }
  log('Sending message to ' + pn + '..');
  client.messages
  .create({
     body: body,
     from: twilio_phoneNumber,
     to: ('' + pn)
   }).then(message => console.log(message.sid)).catch(function(err) {log('ERR: ' + err)});
}

function groupText(pn_list, body) {
  log('Group texting ' + body );
  pn_list.forEach(function(pn) {  send_text_message(pn, body); } );
}


// listen for new event change
async function notifyPeople() {
  try {
    var user_phoneNumbers  = await get_all_user_phoneNumbers();
    if (user_phoneNumbers == null) { log('No user phone numbers!'); return; }
    let voting_options = await getOptionsDispersion();
    if (voting_options == null) { log('No voting options!'); return; }
    var resp = 'Hi there, this is the team at GiveAssist letting you know the voting window is open! Feel free to reply with the digit of your selected option of the month! ';
    var index = 1;
    voting_options.forEach(function(opt) {
      // let option = voting_options[index-1];
      // log('Options: ' + JSON.stringify(opt));
      if ((opt['name'] != null && opt['summary'] != null)) { 
        resp += ('\n\n' + index + '. ');
          let option_string = opt['name'] + '\n' + (opt['summary'].length < 70 ? opt.summary : (opt.summary.substring(0, 70) + '.. [Read more on our site!]'));
          // log('Option string: ' + option_string);
          resp += option_string;
          index++;
      }
    })
    resp += '\n\nhttps://giveassist.org/vote'
    
    groupText(user_phoneNumbers, resp);
    // groupText(user_phoneNumbers, 'https://giveassist.org/vote');
  } catch (e)   {
    log('active event val change error: ' +e );
  }
 }


var get_all_user_phoneNumbers = async () => {
  return new Promise( function(resolve, reject) {
    var numbers = [];
      let ref = root.ref('/users/');
      ref.once('value', function(snap) {
        snap.forEach((child) => {
          // console.log(child.key, child.val()); 
          var user = child.val();
          var user_id = child.key;
          if (user['i'] != null) {
            var user_phone  = user['i']['z'];
            if (user_phone != null) {
              numbers.push(user_phone);
            }
          }
        });
      })
      resolve(numbers);
  })
}

let group  =  ['9086420950', '9086420949', '9086421391'];
// groupText(group, 'hello - Ryan');

var spamChecker = {};
function updateSpamChecker(phone) {
  if (spamChecker[phone] == null) {
    spamChecker[phone] = 1;
  } else {
    spamChecker[phone] = Number(spamChecker[phone]) + 1;
  }
  
  if (spamChecker[phone] > 8) {
    send_text_message('9086421391', 'GIVEASSIST SERVER AUTO MSG: WE ARE GETTING SPAMMED FROM ' + phone);
  }

}


var canPostEvents = async (uid) => {
    
  var event_ref = root.ref('/admins/' + uid + '/');
  return new Promise( function (resolve, reject) {
    event_ref.once('value').then(function(snapshot, err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(snapshot.val());
      }
    });
  })
}


var getOptionsDispersion = async () => {
  return new Promise ( async function(resolve, reject) {
   try {
       let active_event_id = await getActiveEventId();
       
       let snap = await eventSnapshot(active_event_id);
       let event = {
          title: snap["t"],
          summary: snap["s"],
          options: snap["o"],
          id: snap['id']
        };
        var objArray = [];
        if (event) {

            Object.keys(event.options).forEach(function(key) {
              let op_snap = event.options[key];

              // this is the stuff we're using
                var opt = {
                    name: op_snap['t'],
                    summary: op_snap['s'],
                    link: op_snap['link'],
                    id: key,
                };
                objArray.push(opt);
            });
        }
       
       resolve(objArray);
    
   } catch (e) {
       reject(e);
   }      
  })
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



function Customer(cid, amt_contributed) {
  this.CustomerId = cid;
  this.AmountContributed = '$' + amt_contributed;
}

async function customer_charged_successfully (cust_id, amountContributed) {
  return new Promise(async function(resolve, reject) {
    log_group_begin('Processing Customer');
    let uid, active_event, alreadyProcessed, incomeForEvent, totalDonated, totalEventUsers;
    
    try {   uid = await getFirebaseUserFromCustomerId(cust_id);              } catch (e) { err_log('Could not find firebase user for stripe user!'); reject('Could not find firebase user for stripe user! -> ' + e); log_group_end(); return; }

    ok_log(' (1/8) Found uid -> ' + uid);

    try {   active_event = await getActiveEventId();              } catch (e) { err_log(e); reject(e);  log_group_end(); return; }

    ok_log(' (2/8) Found active event -> ' + active_event);
    
    let ap_string = 'We have already processed this user! -> ';
    
    try {  alreadyProcessed = await haveProcessedUserPaymentForEvent(uid, active_event);              } catch (e) { err_log(ap_string + e); reject(e); log_group_end(); return; }
        
    ok_log(' (3/8) we have not yet processed user payment for this month');
    try {   incomeForEvent = await getTotalIncomeForEvent(active_event);              } catch (e) { err_log(e); reject(e);  log_group_end();return; }

    incomeForEvent = Number(incomeForEvent) + amountContributed;

    ok_log(' (4/8) got and incremented income');

    try {   totalDonated = await getTotalDonated(uid);              } catch (e) { err_log(e); reject(e);  log_group_end(); return; }
    
    totalDonated = Number(totalDonated) + amountContributed;

    ok_log(' (5/8) got amount donated and incremented -> ' + totalDonated + ' (contributed ' + amountContributed + ')');

    try {  totalEventUsers = await getTotalUsersForEvent(active_event);              } catch (e) { err_log(e); reject(e);  log_group_end(); return; }

    totalEventUsers = Number(totalEventUsers)+1;

    ok_log(' (6/8) got total event users and incremented');
    
    // ok_log('Adding ' + amountContributed + ' to user: ' + uid + '\n  for successful charge for event ' + active_event);

    try {  user_plan = await getUserInfo(uid); ok_log('got userinfo'); log(JSON.stringify(user_plan)); user_plan = user_plan['p'].split(',')[0];                                       } catch (e) { err_log(e); reject(e);  log_group_end(); return; }
    
    ok_log(' (7/8) got user plan -> ' + user_plan);

    try {  planTotalCount = await getPremiumPlanTotalCount(user_plan);                                       } catch (e) { err_log(e); reject(e);  log_group_end(); return; }

    planTotalCount++;

    ok_log(' (8/8) got plan total count -> ' + planTotalCount);

    ok_log('completed db requests');
    

    // Set amount that user donated
    root.ref('/users/' + uid + '/v/' + active_event + '/don/').set(amountContributed)
    
    root.ref('/users/' + uid + '/d/t').set(totalDonated)

    root.ref('/db/events/' + active_event + '/ttl/').set(Math.round(incomeForEvent, 3));

    DBLinks.eventTotalUsers(active_event).setValue(totalEventUsers);
    DBLinks.premiumPlanTotalCount(user_plan).setValue(planTotalCount);
    DBLinks.premiumPlanMostRecent(user_plan).setValue(moment().format('LL'));

    DBLinks.prevChargeStatus(uid).setValue('OK');

    ok_log('Finished processing charge!');

    resolve('Finished processing charge!');
    log_group_end();
  })
}


/**
 * Gets the total amt donated
 * @return {[String]} the user id
 */
var getTotalDonated = async (uid) => {
  return new Promise ( function(resolve, reject) { DBLinks.totalDonated(uid).fetch().then((res) => resolve(res)).catch((err) => reject(err)); });
}



var getPrevChargeStatus = async (uid) => {
  return new Promise ( function(resolve, reject) { DBLinks.prevChargeStatus(uid).fetch().then((res) => {(res != 'FAILED') ? resolve(res) :  reject('Please update your payment info, then hop back to submit that vote!')}).catch((err) => reject('Please update your payment info, then hop back to submit that vote!')); });
}


/**
 * Gets the total users for an event
 * @return {[String]} the active event id
 */
var getTotalUsersForEvent = async (eventId) => {
  return new Promise ( function(resolve, reject) { DBLinks.eventTotalUsers(eventId).fetch().then((res) => resolve(res)).catch((err) => reject(err)); });
}



var getUserInfo = async (uid) => {
  return new Promise ( function(resolve, reject) { DBLinks.userInfo(uid).fetch().then((res) => resolve(res)).catch((err) => reject(err)); });
}

var mostRecentlyAddedEvent = async () => {
  return new Promise ( function(resolve, reject) {
    var events_ref = root.ref('/db/events/').limitToLast(1);
    events_ref.once('value').then (function(snap) {
        console.log('Snapback & unload');
        if (snap && snap.val())
            resolve(snap.val())
        else
            reject('Ay carumba!!!')
    })
  })
}


function cast_texted_vote(user_vote, msg_from) {
  return new Promise(async (resolve, reject) => {
    updateSpamChecker(msg_from);

    let user_id = await idFromNumber(msg_from);
    log('got user id ' + user_id);
    if (user_id != null) {
      log('Got user id (non-null)..');
      let active_event = await getActiveEventId();
      let voting_options = await getOptionsDispersion();
      log('Got active event & voting options..');

      // check text is a number
      if(isNaN(user_vote)){
        // it's NOT a number
        reject('User text was not a number');
      } else { 
        //  it's a number
        if (voting_options.length > Number(user_vote))  {
          // can vote this..  VOTE
          let voteId = voting_options[Number(user_vote)-1 /* we give them 1..n not 0..n */ ].id;
          log('Got vote id.. casting vote with: \n EventId: '+active_event +'\n VoteId: ' + voteId + '\n UID: ' + user_id);
          let casted_vote = await castVote(active_event,voteId, user_id);

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


var performMonthlyRollover = () => {
  return new Promise ( async function (resolve, reject) {
    log_group_begin('Monthly Rollover');
    try {
      
      log('Payout created');
      let active_event = await getActiveEventId();
      let winningOption = await getWinningOptionForEvent(active_event);

      let ref_string = '/db/events/' + active_event + '/w';

      log('Got options.. now ref string is => ' + ref_string);
      log('winning op was: ' + JSON.stringify(winningOption));

      let nextEvent = await mostRecentlyAddedEvent();

      nextEvent = Object.keys(nextEvent) != null ? Object.keys(nextEvent)[0] : null;

      log('ne => ' + nextEvent);

      if (nextEvent == null) { throw('Cannot find a next event!'); }
      
      root.ref(ref_string).set(winningOption);

      // ------- UPATE WINNING OPTION AS WINNING OPTION ------- // 
            
      root.ref('/db/active_event/').set(nextEvent);

      notifyPeople();
      
      resolve('Good!');
  } catch (e) {

    err_log(e);
    reject(e);
  }
  log_group_end();
  });
}




var validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

var validatePhone = (phone) => {
   var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
   return re.test(String(phone));
}

varextractPhoneNumber = (uncleaned) => {
  var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
  return cleaned;
}

var makeid = () => {
  var length = 6;
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

var randstring = (l) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz    ';
  var charactersLength = characters.length;
  for ( var i = 0; i < l; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


// trim the 'remium ' out of each option (for space)
var untrimSelectedOptionName = (opt) =>  {
  opt = opt + '';
  return opt.split(',')[0];
}

// trim the 'remium ' out of each option (for space)
var untrimSelectedOptionAmount = (opt) =>  {
  opt = opt + '';
  let spl = opt.split(',');
  // log(spl);
  return opt.split(',')[1];
}



var idFromNumber = async (phone) => {
  return new Promise( function(resolve, reject) {
      let ref = root.ref('/users/');
      ref.once('value', function(snap) {
        snap.forEach((child) => {
          // console.log(child.key, child.val()); 
          var user = child.val();
          var user_id = child.key;
          if (user['i'] != null) {
            // log('found user info!: ' + JSON.stringify(user['i']));
            var user_phone  = user['i']['z'];
            if (user_phone != null) {
              
              // log('found user phone!: ' + extractPhoneNumber(user_phone) + ' (v. ' + extractPhoneNumber(phone) + ' => ' + (user_phone == phone ? 'TRUE' : 'FALSE') + ' )');
              // match
              if (comparePhoneNumbers(user_phone, phone)){
                // log('resolving id-from-number');
                  resolve(user_id);
              }
            }
          }

        });
        log('rejecting id-from-number');
        reject(null);
      })

  })
}

var planIDForNameAndAmt = (untrimmed_nameAndAmt) => {
  let name = untrimSelectedOptionName(untrimmed_nameAndAmt);
  if (name != 'PX' && name != 'PY' && name != 'PZ' ) {
    // console.log('Inavlid plan param (' +name+'): not one of options!')
    return new Error('Invalid planIDForNameAndAmt parameter! (' + untrimmed_nameAndAmt + ')');
  }
  if (name == 'PX') {
      return 'plan_FOXcPq3uHNqx4X';
  }
  else if (name == 'PY') {
      return 'plan_FOXdWHDyLP44tO';
  }
  else if (name == 'PZ') {
    return 'plan_FNDp8ntFqUpWgO';
  }
  else return null;
}


var quantityForNameAndAmt = (untrimmed_nameAndAmt) => {
    // log('Quantity for name and amt.. IN: ' + untrimmed_nameAndAmt)
  let name = untrimSelectedOptionName(untrimmed_nameAndAmt);
  // log('name is ' + name);

  let amt = Number(parseFloat(untrimSelectedOptionAmount(untrimmed_nameAndAmt)));
  // log('amt is ' + amt);
  if (amt == null || name == null || isNaN(amt)) {
    return new Error('Invalid quantityForNameAndAmt parameter! (' + untrimmed_nameAndAmt + ')');
  }
  amt = Number(amt);
  if (name == 'PX') {
      let q = Math.round(amt.toFixed(2) / PRICE_PREM_X.toFixed(2));
      // log('User buying '  + q + ' units of ' + name + '..');
      return q;
  }
  else if (name == 'PY') {
    let q = Math.round(amt.toFixed(2) / PRICE_PREM_Y.toFixed(2));
    // log('User buying '  + q + ' units of ' + name + '..');
    return q;
    }
  else if (name == 'PZ') {
    let q = Math.round(amt.toFixed(2) / PRICE_PREM_Z.toFixed(2));
    // log('User buying '  + q + ' units of ' + name + '..');
    return q;
    }
  else return null;
}



async function get_decoded_token(idToken)  {
  return new Promise(async function(resolve, reject) {
    admin.auth().verifyIdToken(idToken).then(function(tkn) {
      ok_log('Found token');
      if (tkn != null) {resolve(tkn); } else { reject(tkn); }
    }).catch(function(err) {
      err_log('Finding token -> ' + err);
      reject(err);
    })
  })
}


var getFirebaseUserFromCustomerId = async (cust_id) => {
    return new Promise( function(resolve, reject) {
        let ref = root.ref('/stripe_ids/' + cust_id + '/uid/');
        ref.once('value', function(snap) {
            if (snap && snap.val())
                resolve(snap.val())
            else
                reject(new Error('Snap.val() did not exist!'))
        })
    })
}

/**
 * Gets the active event id
 * @return {[String]} the active event id
 */
var getActiveEventId = async () => {

  let event_ref = root.ref('/db/active_event');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot) {
      resolve(snapshot.val());
    }).catch(function(err) {
      reject(err.message);
    });
  })

}

function getToday() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  } 
  if (mm < 10) {
    mm = '0' + mm;
  } 
  var td = mm + '/' + dd + '/' + yyyy;
  return td;
}

let PLAN = {
  premiumX: 'PX',
  premiumY: 'PY',
  premiumZ: 'PZ',
}

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
  totalDonated: function (uid) { return new Link( root.ref('/users/' + uid + '/d'), 't'); },
  eventTotalUsers:  function (eventId) { return new Link( root.ref('/db/events/' + eventId), 'tu'); },
  prevChargeStatus: function (uid){ return new Link( root.ref('/users/' + uid + '/st'), 'pcs'); },
  eventVoters: function(eventId, voteId) { return new Link( root.ref('/db/events/' + eventId + '/o/' + voteId+'/vrs/'), null); },
  userVoteChoice: function(userid, eventId) { return new Link( root.ref('/users/' + userid + '/v/' + eventId), 'c'); },
  eventOptionTotalVotes: function(eventId, voteId) { return new Link(root.ref('/db/events/' + eventId + '/o/' + voteId), 'ttl'); },// remove ttl
  eventOverallTotalVotes: function(eventId) { return  new Link(root.ref('/db/events/'+eventId+'/o'), 'ttl'); },  //  remove ttl
  premiumPlanTotalCount: function(plan) { return  new Link(root.ref('/db/plans/'+plan), 'ttl') },  
  premiumPlanMostRecent: function(plan) { return  new Link(root.ref('/db/plans/'+plan), 'mr') }, // remove mr
  userInfo: function (uid){ return new Link( root.ref('/users/' + uid + '/i')) }
} 

// var db_fetch = async (ref) => {
//   log('fetching ' + ref)
//   return new Promise ( function(resolve, reject) {
//     var events_ref = root.ref(ref);
//     events_ref.once('value').then (function(snap) {
//         if (snap && snap.val())
//             resolve(snap.val())
//         else
//             reject('No snapshot value found')
//     }).catch(function(err) { reject(err) })
//   })
// }

var getPremiumPlanTotalCount = async (plan) => {
  return new Promise ( function(resolve, reject) { DBLinks.premiumPlanTotalCount(plan).fetch().then((res) => resolve(res)).catch((err) => reject(err)) });
}
var getPremiumPlanMostRecent = async (plan) => {
  return new Promise ( function(resolve, reject) { DBLinks.premiumPlanMostRecent(plan).fetch().then((res) => resolve(res)).catch((err) => reject(err)) });
}

var get_plan_total_counts = async () => {
  return new Promise(async function(resolve, reject){
    try {
      let premx = await getPremiumPlanTotalCount(PLAN.premiumX); ok_log('got premx count  ->  '  + JSON.stringify(premx)); 
      let premy = await getPremiumPlanTotalCount(PLAN.premiumY); ok_log('got premy count  ->  '  + premy); 
      let premz = await getPremiumPlanTotalCount(PLAN.premiumZ); ok_log('got premz count  ->  '  + premz); 
      resolve( { x: premx, y: premy, z: premz } );
    } catch (e) { err_log(e); reject(e); }
  })
}
var get_plan_most_recents = async () => {
  return new Promise(async function(resolve, reject){
    try {
      let premx = await getPremiumPlanMostRecent(PLAN.premiumX); ok_log('got premx count  ->  '  + premx); 
      let premy = await getPremiumPlanMostRecent(PLAN.premiumY); ok_log('got premy count  ->  '  + premy); 
      let premz = await getPremiumPlanMostRecent(PLAN.premiumZ); ok_log('got premz count  ->  '  + premz); 
      resolve( { x: premx, y: premy, z: premz } );
    } catch (e) { err_log(e); reject(e); }
  })
}



var get_plan_stats = async () => {
  return new Promise(async function(resolve, reject){
    try {
      let counts =  await get_plan_total_counts();
      let recents = await get_plan_most_recents();
      resolve( {  counts: counts, recents: recents } )
    } catch (e) { reject(e); };
  })
};

var user_info_problems = (userJson) => {

  // Validate each property
  let nameIsOk = userJson.n != null && userJson.n != '' && userJson.n.length > 4;
  let emailIsOk = userJson.e != null && validateEmail(userJson.e);
  let planIsOk = userJson.p != null && planIDForNameAndAmt(userJson.p) != null;
  let phoneIsOk = userJson.z != null && validatePhone(userJson.z);
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

  // All fields cleared
  var userJson = {
      n: n,                           // name
      e: e,                           // email
      p: p,                           // plan
      dn: dn,                         // display name
      j: getToday(),                  // timestamp
      z: z                            // phone number
  };
  
  let problems = user_info_problems(userJson);
  
  if (problems == null) {
      // log('Info post passed requirements..');
      userJson['dn'] =  makeid();
      // Set user info
      root.ref('/users/'+(uid)+'/i/').set(userJson);
      // set db stuff
      root.ref('/queriable/'+uid+'/dn').set(userJson.dn);
      root.ref('/users/' + uid + '/d/t').set(0);
      // log('User info posted.');
      return true;
  } else {
      return false;
  }
}

async function executeCreateSubscription (uid, planNameAndAmount) {
  return new Promise( async function(resolve, reject) {
      // log('Executing create sub of: ' + planNameAndAmount);

      try {

          let customer_id = await getStripeCustomerId(uid);

          var plan = planIDForNameAndAmt(planNameAndAmount);
          var amt = quantityForNameAndAmt(planNameAndAmount);

            // Create the user subscription
            stripe.subscriptions.create({
                customer: customer_id,
                items: [
                  {
                    plan: plan,
                    quantity: amt,
                  },
                ],
              }, {
                stripe_account: "[REDACTED]",
              }, function(err, subscription) {
                if (subscription) {

                  // log('OK Generated subscription!')
                  root.ref('/users/' + uid + '/sub/').set(subscription.id);
                  root.ref('/queriable/'+uid+'/p').set(planNameAndAmount);
                  resolve(subscription.id);
                  return;
                } else {
                  // log('BAD Did NOT Generate subscription! Error: ' + err);
                  reject(err);
                  return;
                }
              }); 
      } catch (err) {
        // logn('FUNCTION executeCreateSubscription Error: ' + err)
      reject('Payment could not process! Failed with error: ' + err);
      }
  })

}

async function createStripeUser (paymentToken, email, uid) {
  return new Promise(async function (resolve, reject) {
    try {
      // log('Creating stripe user with inputs: \ntkn: ' + JSON.stringify(paymentToken) + '\neml: ' + email);
        // Create a Customer:
        const customer = await stripe.customers.create({
          source: paymentToken,
          email: email,
        })
        
        if (customer) {
            let customer_id = customer.id;
            if (uid && customer_id) {
                // console.log('sUID: ' + uid)
                // console.log('sCustomer ID: ' + customer_id)
                root.ref('/users/' + uid + '/st/id/').set(customer_id)
                root.ref('/stripe_ids/' + customer_id + '/uid/').set(uid);
                // ok_log('we have a stripe customer id -> ' + customer_id);
                resolve(customer_id);
                return;
            } else {
                // log('Could not create stripe user!')
                reject('Could not create payment-backed user!');
                return;
            }
        } else {
            reject('Could not create customer!');
            return;
        }
    } catch (e) {
      reject('Could not create customer! -> ' + e);
      return;
    }
  })
}

async function deleteUser(uid) {
  return new Promise(async function (resolve, reject) {

    getStripeCustomerId(uid).then(function(cust_id){

      // log('OK Got stripe info..');

      stripe.customers.del(cust_id,
        function(err, confirmation) {
          if (confirmation) {
              
              // Clear firebase references
              root.ref('/users/' + uid + '/').set(null);
              root.ref('/queriable/' + uid + '/').set(null);
              root.ref('/stripe_ids/' + cust_id + '/').set(null);

              // Delete user from auth
              admin.auth().deleteUser(uid)
                .then(function() {
                  // console.log("Successfully deleted user");
                  resolve("Successfully deleted user");
                  return;
                })
                .catch(function(error) {
                  // console.log("Error deleting user: " + error);
                  reject(error);
                  return;
                });
          } else {
              if (err) {
                reject('Delete User confirmation error: ' + err);
              } else {
                reject('Unknown error result of delete user!');
              }
              return;
          }
        }
      );

    }).catch(function(e) {
      // Clear firebase references
      root.ref('/users/' + uid + '/').set(null);
      root.ref('/queriable/' + uid + '/').set(null);

      // Delete user from auth
      admin.auth().deleteUser(uid)
        .then(function() {
          // console.log("Successfully deleted user");
          resolve("Successfully deleted user");
          return;
        })
        .catch(function(error) {
          // console.log("Error deleting user:", error);
          reject(error);
          return;
        });
    });
  })
  
}

// ____________________________________________________________________________________________________________________________________________
// ____________________________________________________________________________________________________________________________________________

module.exports = { 
  getWinningOptionForEvent: async function (active_event_id) { return getWinningOptionForEvent(active_event_id); },
  updateSpamChecker: function(num) { return updateSpamChecker(num); },
  Customer: function(cid, amt_contributed) { return Customer(cid, amt_contributed); },
  customer_charged_successfully: async function(cust_id, amountContributed) { return await customer_charged_successfully(cust_id, amountContributed); },
  cast_texted_vote: async function (user_vote, msg_from){ return await cast_texted_vote(user_vote, msg_from); },
  getTotalDonated: async function(uid) { return await getTotalDonated(uid); },
  canPostEvents: async function(uid) { return await canPostEvents(uid); },
  getUserInfo: async function(uid) { return await getUserInfo(uid); },
  getPrevChargeStatus: async function(uid) { return await getPrevChargeStatus(uid); },
  getTotalUsersForEvent: async function(eventId) { return await getTotalUsersForEvent(eventId); },
  getOptionsDispersion: async function() { return await getOptionsDispersion(); },
  performMonthlyRollover: async function() { return await performMonthlyRollover(); },
  get_decoded_token: async function(tkn) { return await get_decoded_token(tkn); },
  getActiveEventId: async function() { return await getActiveEventId(); },
  getPremiumPlanMostRecent: async function(plan) { return await getPremiumPlanMostRecent(plan); },
  getPremiumPlanTotalCount: async function(plan) { return await getPremiumPlanTotalCount(plan); },
  get_plan_total_counts: async function() { return await get_plan_total_counts(); },
  idFromNumber: async function(ph) { return await idFromNumber(ph); },
  getFirebaseUserFromCustomerId: async function(i) { return await getFirebaseUserFromCustomerId(i); },
  make_test_event: function() { return make_test_event(); },
    TEST_MODE: TEST_MODE,
    root: root,
    stripe: stripe,
    PLAN: PLAN,
    DBLinks: DBLinks,
    Link: Link,
    randomNumber: function() {return rNumber(); },
    user_info_problems: function(json) { return user_info_problems(json); },
    postUserInfo: function (n,e,p,dn,z, uid) {
        return postUserInfo(n,e,p,dn,z,uid);
    },
    
    get_plan_stats: async () => { return new Promise(function(resolve, reject) { get_plan_stats().then((res) => resolve(res)).catch((err) => reject(err)) })},
    getPremiumPlanTotalCount: async (plan) => { return new Promise(function(resolve, reject) { getPremiumPlanTotalCount(plan).then((res) => resolve(res)).catch((err) => reject(err)) })},
    getPremiumPlanMostRecent: async (plan) => { return new Promise(function(resolve, reject) { getPremiumPlanMostRecent(plan).then((res) => resolve(res)).catch((err) => reject(err)) })},
    deleteUser: async function (uid) {
      return new Promise( function(resolve, reject) {
        deleteUser(uid).then(function(resp) {resolve(resp); }).catch(function(err) { reject(err); });
      })
    },
    createStripeUser: async function (paymentToken, email, uid) {
      return new Promise( function(resolve, reject) {
        createStripeUser(paymentToken,email,uid).then(function(resp) {resolve(resp); }).catch(function(err) { reject(err); })
      })
    },
    executeCreateSubscription: async function (uid, planNameAndAmount) {
      return new Promise( function(resolve, reject) {
        executeCreateSubscription(uid, planNameAndAmount).then(function(resp) {resolve(resp); }).catch(function(err) { reject(err); })
      })
    },
  //   getUserInfo:  async function (uid) {
  //     return new Promise( function(resolve, reject) {
  //       let ref = root.ref('/users/' + uid + '/i/');
  //         ref.once('value').then (function(snap) {
  //             if (snap && snap.val())
  //                 resolve(snap.val())
  //             else
  //                 resolve(null)
  //         })
  //     })
  // },
  userExists: async function (uid) {
    return new Promise( function(resolve, reject) {
        admin.auth().getUser(uid).then(function(userRecord) { resolve(userRecord);}).catch(function(error) {resolve(null);});
    })
  },
  initiate_new_user: async function (email, password, usr, paymentToken) {
    return new Promise(async function(resolve,  reject)  {
      
      let unclean_user_info = user_info_problems(usr);
      if (unclean_user_info) { reject(unclean_user_info); return; }
  
      let new_user = new User(usr.n,email, password, usr.p, usr.dn, usr.j, usr.z);

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
        reject(e);
        return;
      }
  
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

      DBLinks.totalDonated(uid).setValue(0);

      ok_log('init. total donated for uid -> ' + uid);

      resolve(uid);
  
    });
  }
    
};
  
  
  
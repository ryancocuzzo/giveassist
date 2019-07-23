var Express = require('express');
var axios = require('axios');
var https = require('https');
var bodyParser = require('body-parser');
var fs = require('fs');
var admin = require("firebase-admin");
var moment = require('moment');
var app = Express();
var utils = require('./util.js');
var clc = require("cli-color");
var stripe = utils.stripe;

const MessagingResponse = require('twilio').twiml.MessagingResponse;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// create application/json parser
var jsonParser = bodyParser.json()
 
// // create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(jsonParser);

app.use(bodyParser.urlencoded({
  extended: true
}));

process.env.NODE_ENV = 'production';

// This is the port we are using. It will default to our System default but, in test mode, it is set to port 1234. This was done so that it doesn't conflict with the default blockchain ports.
var port = process.env.PORT || 1234;

function table_log(output)  {console.table(output);}
function log(output) {console.log(output)}
function logn(output) {console.log('\n' + output)}
function err_log(output) {logn(clc.red.bold('Error ') + output);}
function ok_log(output) { logn(clc.green.bold('OK ') + output);}
function warning_log(output) {logn(clc.cyan.bold('OK ') + output);}
function log_group_begin(text) {console.group('\n-- -- ' + text + ' -- --\n');}

function log_group_end() { console.groupEnd(); console.log('\n-- -- \n'); }

let DBLinks = utils.DBLinks;
let PLAN = utils.PLAN;

function Customer(cid, amt_contributed) {
  this.CustomerId = cid;
  this.AmountContributed = '$' + amt_contributed;
}



// Get a reference to the root of the Database
var root = utils.root; //admin.database();
var storage_root = admin.storage();

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

const accountSid = '[REDACTED]';
const twilio_phoneNumber = '+19083049973';
const authToken = '[REDACTED]';
const client = require('twilio')(accountSid, authToken);

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

app.post('/sms', async (req, res) =>  {
    try {

      var user_vote = req.body.Body;
      var msg_from = req.body.From;

      log('Got user reply info..');

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
          throw('User text was not a number');
         } else { 
          //  it's a number
          if (voting_options.length > Number(user_vote))  {
            // can vote this..  VOTE
            let voteId = voting_options[Number(user_vote)-1 /* we give them 1..n not 0..n */ ].id;
            log('Got vote id.. casting vote with: \n EventId: '+active_event +'\n VoteId: ' + voteId + '\n UID: ' + user_id);
            let casted_vote = await castVote(active_event,voteId, user_id);

            const twiml = new MessagingResponse();

            twiml.message('Vote submitted!');
          
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());

            

            // send_text_message(msg_from, 'Vote submitted!');
          } else {
            //can't vote this
            throw('User text was not a valid vote index');
          }
         }
      }

    } catch (e)  {
      log('Caught SMS Error: ' + e);
      const twiml = new MessagingResponse();
      twiml.message('Sorry, we couldn\'t process your vote! Please double-check that the option you\'ve selected is valid!');
      res.writeHead(500, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
})
 
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


app.post('/smserror', (req, res) =>  {
    log('TWILIO ERROR: ' + JSON.stringify(req.body.ErrorCode));
    const twiml = new MessagingResponse();
    twiml.message('Sorry, we couldn\'t process your vote! Please double-check that the option you\'ve selected is valid!');
    res.writeHead(500, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
})

app.get('/', (req, res)  => {
    res.send('Running..')
})

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

String.prototype.replaceAll = function(search, replacement) {
  var target = this + '';
  return target.split(search).join(replacement);
};

var extractPhoneNumber = (uncleaned) => {
  var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
  return cleaned;
}

var comparePhoneNumbers  = (a, b) => {
  var same_10 = (extractPhoneNumber(a).slice(-10) == extractPhoneNumber(b).slice(-10));
  return same_10; // no country compare yet
}

var s = '908-642-1391';
var  x =  extractPhoneNumber(s);
log(x);

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

// idFromNumber(s).then(function(z) {log('RESP: '+z);}).catch(function(q){log('ERR:' + q);});

// Get the priveledges of a user
app.get('/eventPriviledges', (req, res)  => {
//    log('\n' + 'Getting event priveledges.')
    
    var idToken = req.query.idToken;

    admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        
            if (decodedToken) {
                var uid = decodedToken.uid;
                
                canPostEvents(uid).then(function(canPost) {
//                    log('User ' + uid + ' can post: ' + canPost)
                    if (canPost != null) 
                        res.send( canPost );
                    else 
                        res.send(false); 
                }).catch(function(err) {
                    log('err: ' + err)
                    res.send(false);
                })
            } else {
                log('No decoded token!')
                res.send(false);
            }
        
      }).catch(function(error) {
        log('err!')
        // Handle error
        res.send(false);
      });

})

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

app.post('/initiate_new_user', async (req, res) => {
  if (req.body == null || req.body.params == null) { res.send('Error');return; }
    
  var password = req.body.params.pw; // note pw, not password
  var paymentToken = req.body.params.paymentToken; 

  var usr = {
    n: req.body.params.n,                           // name
    e: req.body.params.e,                           // email
    p: req.body.params.p,                           // plan
    dn: req.body.params.dn,                         // display name
    j: getToday(),                                  // timestamp
    z: req.body.params.z                            // phone number
  };
  try {
    let result = await utils.initiate_new_user(usr.e, password, usr, paymentToken);
    res.send(result);
  } catch (e) {
    err_log('RESOLVE-> ' + e);
    res.send(e);
  }
});

// Get the priveledges of a user
app.post('/createEvent', (req, res)  => {
    
    var idToken = req.body.params.idToken;
    var event = req.body.params.event;

    admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        if (decodedToken) {
            var uid = decodedToken.uid;
            let ref = root.ref('/db/events/');
            // Generate a reference to a new location and add some data using push()
            var newPostRef = ref.push(event);
            // Get the unique ID generated by push() by accessing its key
            var eventId = newPostRef.key;
            let child_ref = ref.ref(eventId + '/id/');
            child_ref.set(eventId);
            
            res.send(true);
        } else {
            res.send(false);
        }
        
      }).catch(function(error) {
        // Handle error
        res.send(false);
      });
    
    
})


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

/**
 * Gets the total users for an event
 * @return {[String]} the active event id
 */
var getTotalUsersForEvent = async (eventId) => {
  return new Promise ( function(resolve, reject) { utils.DBLinks.eventTotalUsers(eventId).fetch().then((res) => resolve(res)).catch((err) => reject(err)); });
}

app.get('/totalUsersForEvent', async function(req, res) {
  if (req == null || req.query == null) { res.send(new Error('invalid request')); return;}
  getTotalUsersForEvent(req.query.eventId).then((total) => res.send(total)).catch((e) => res.send(e));
});


/**
 * Gets the total amt donated
 * @return {[String]} the user id
 */
var getTotalDonated = async (uid) => {
  return new Promise ( function(resolve, reject) { utils.DBLinks.totalDonated(uid).fetch().then((res) => resolve(res)).catch((err) => reject(err)); });
}

var getPrevChargeStatus = async (uid) => {
  return new Promise ( function(resolve, reject) { utils.DBLinks.prevChargeStatus(uid).fetch().then((res) => {(res != 'FAILED') ? resolve(res) :  reject('Please update your payment info, then hop back to submit that vote!')}).catch((err) => reject('Please update your payment info, then hop back to submit that vote!')); });
}

app.get('/get_plan_stats', async (req,res) => {
  
  if (req == null || req.query == null) { res.send(new Error('invalid request')); return;}
  utils.get_plan_stats().then((obj) => res.send(obj)).catch((e) => res.send(e));
});

var getUserInfo = async (uid) => {
  return new Promise ( function(resolve, reject) { utils.DBLinks.userInfo(uid).fetch().then((res) => resolve(res)).catch((err) => reject(err)); });
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



var getWinningOptionForEvent = async (eventId) => {
  return new Promise ( async function(resolve, reject) {
   try {
       let active_event_id = await getActiveEventId();
       let eventSnapshot = await eventSnapshot(active_event_id);
       let event = {
          title: event["t"],
          summary: event["s"],
          options: event["o"],
          id: event['id']
        }
    
        var winner = {
            votes: null,
            id: null
        };
        if (event) {

            Object.keys(event.options).forEach(function(key) {
                var votes = event.options[key].voters.length;
                if (votes > winner.votes) {
                    winner.votes = votes;
                    winner.id = key;
                } else if (votes == winner.votes) {
                    // Randomly determine winner
                    if (Math.random() > 0.5) {
                        winner.votes = votes;
                        winner.id = key;
                    };
                }
                
            });
        }
       
       resolve(winner);
    
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

var performMonthlyRollover = () => {
  return new Promise ( async function () {
    log_group_begin('Monthly Rollover');
    try {
      
      log('Payout created');
      let active_event = await getActiveEventId();
      let winningOption = await getWinningOptionForEvent(active_event);
      
      root.ref('/db/events/' + active_event + '/w').set(winningOption);

      // ------- UPATE WINNING OPTION AS WINNING OPTION ------- // 
      
      let nextEvent = await mostRecentlyAddedEvent();
      
      root.ref('/db/active_event/').set(nextEvent.id);

      notifyPeople();
      
      response.send('Good!');
  } catch (e) {

    err_log(e);
    reject(e);
  }
  log_group_end();
  });
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

    try {  planTotalCount = await utils.getPremiumPlanTotalCount(user_plan);                                       } catch (e) { err_log(e); reject(e);  log_group_end(); return; }

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

app.post('/event_log', async function(request, response) {
  // Retrieve the request's body and parse it as JSON:
    const event_json = request.body;
    if (event_json.type == 'charge.succeeded') {
        try {
            
            ok_log('charge succeeded');
            let object = event_json.data.object;

            JSON.stringify(object);

            let cust_id = object.customer;
            let amountContributed = Number(object.amount);

            amountContributed = amountContributed / 100;

            ok_log('found customer id and the amount they contributed!');
            table_log([new Customer(cust_id, amountContributed)]);
            
            let successful_charge = await customer_charged_successfully(cust_id, amountContributed);
                
            response.send(successful_charge);
            
        } catch (e) { err_log(e); response.send(e); return; }
    } else if (event_json.type == 'payout.created') {

      performMonthlyRollover().then(function(out) { res.send(out); }).catch(function(e) {res.send(e);});

    } else if (event_json.type == 'charge.failed') {

      err_log('charge failed')

      let object = event_json.data.object;

      let cust_id = object.customer;
      try {
        let uid = await getFirebaseUserFromCustomerId(cust_id);
        DBLinks.prevChargeStatus(uid).setValue('FAILED');
        response.send('ok - failed.')
      } catch (e) {
        err_log('Could not find customer');
        response.send('Could not find customer');
      }

    }
    
    else { response.send("ok");}

});
    

app.get('/changePaymentSource', async (req,res) => {
    console.log('Changing stripe user source payment...')
    var idToken = req.query.idToken;
    var paymentToken = req.query.paymentToken;
    
    try {
       
        // Get decoded token
        let decodedToken = await get_decoded_token(idToken);

        var uid = decodedToken.uid;
        var cust_id = await getStripeCustomerId(uid);
          
          
          let x = await stripe.customers.createSource(cust_id, {
            source: paymentToken
          });
          
          // Perform update
          stripe.customers.update(cust_id, {
            default_source: x.id
          }, function(err, resp) {
                if (resp) {
                    log(resp)
                    res.send(resp)
                } else {
                    log(err)
                    res.send(err)
                }
          }); 
    } catch(e) {
        res.send('Server error: ' + e);
    }
    
})


var getUserSubscriptionId = async (uid) => {
    return new Promise( function(resolve, reject) {
        let ref = root.ref('/users/' + uid + '/sub');
        ref.once('value', function(snap) {
            if (snap && snap.val())
                resolve(snap.val())
            else
                reject(new Error('Snap.val() did not exist!'))
        })
    })
}

app.get('/change_plan', async (req,res) => {
    
    var idToken = req.query.idToken;
    var planName = req.query.plan;
    
    var planId = planIDForNameAndAmt(planName);
    
    try {

        // Get decoded token
        let decodedToken = await get_decoded_token(idToken);

        var uid = decodedToken.uid;
        var sub_id = await getUserSubscriptionId(uid);
        
          
        const subscription = await stripe.subscriptions.retrieve(sub_id);
        
        stripe.subscriptions.update(sub_id, {
          cancel_at_period_end: false,
          items: [{
            id: subscription.items.data[0].id,
            plan: planId,
          }]
        }, function(err, subscription) {
              if (subscription) {

                log('Got subscription!')
                root.ref('/users/' + uid + '/sub').set(subscription.id);

                root.ref('/users/' + uid + '/i/p/').set(planName);
                root.ref('/queriable/' + uid + '/p').set(planName);

                
                res.send(subscription)
              } else {
                  err_log(err);
                  res.send(err);
              }
              }); 
          
    } catch(e) {
        res.send('Server error: ' + e);
    }
    
})
        
app.get('/deleteUser', async (req,res) => {

  var idToken = req.query.idToken;
  
  log_group_begin('POST Delete User..');
  try {
    // Get decoded token
    let decodedToken = await get_decoded_token(idToken);

    ok_log('DELETE authenticated..');
      
    var uid = decodedToken.uid;
    
    let deleted_user_response = await utils.deleteUser(uid);

    ok_log('Successfully deleted user');

    res.send('Done');

  } catch (e) {
    err_log('Could not delete user -> ' + e);
    res.send(e);
  }

  log_group_end();

})


var userHasAlreadyVoted = async (eventId, userId) => {
    return new Promise( async function(resolve, reject) {
        log('checking if user ' + userId + ' has voted..')
        try {

            let event_ref = root.ref('/users/' + userId + '/v/' + eventId + '/c');
            event_ref.once('value').then(function(snapshot, err) {
                if (err) { resolve(false) }
                if (snapshot && snapshot.val()) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            });
            
        } catch (e) {
            reject(e);
        }
    })
}

var castVote = async (eventId, voteId, userId) => {
  return new Promise( async function(resolve, reject) {

      try {
          
          let hasVoted = await userHasAlreadyVoted(eventId, userId);
          if (hasVoted == true) { err_log('User has already voted!'); reject('It seens you have already voted!'); return; }
          ok_log('(User hasn\'t voted yet')
          let user_payment_succeeded = await getPrevChargeStatus(userId);
          ok_log('User payment clean')

          DBLinks.eventVoters(eventId, voteId).pushValue(userId)
          DBLinks.userVoteChoice(userId, eventId).setValue(voteId);

          ok_log('User payment clean')

          // logn("Attempting to cast vote on { " + eventId + ", " + voteId + " }...");

          /*  Cast vote to the place  */

          let event_option_votes = await utils.DBLinks.eventOptionTotalVotes(eventId, voteId).fetch();

          ok_log('got total option votes -> ' + event_option_votes)

          event_option_votes = Number(event_option_votes) + 1;
          DBLinks.eventOptionTotalVotes(eventId, voteId).setValue(event_option_votes);

          ok_log('updated total option votes -> ' + event_option_votes)

          /*  Update event's total as well  */

          let event_total_votes = await utils.DBLinks.eventOverallTotalVotes(eventId).fetch();

          ok_log('got total event votes')

          event_total_votes = Number(event_total_votes);
          event_total_votes++;
          DBLinks.eventOverallTotalVotes(eventId).setValue(event_total_votes);

          ok_log('updated total event votes')

          ok_log('Casted vote for user -> ' + userId);

          resolve('ok');

      } catch (e) {
          err_log(e);
          reject(e);
      }
      
  })
}

app.get('/castVote', async (req,res) => {
    
    var idToken = req.query.idToken;
    var voteId = req.query.voteId;
    var eventId = req.query.eventId;
    
    try {

      let decodedToken = await get_decoded_token(idToken);
      let castedVote = await castVote(eventId, voteId, decodedToken.uid);
      res.send(castedVote);

    } catch(e) {
        err_log(e.message);
        res.send('Could not cast your vote!');
    }
})


app.listen(port, () => console.log('Server running on port '+ port + '!\n'))
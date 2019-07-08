var Express = require('express');
var axios = require('axios');
var https = require('https');
var bodyParser = require('body-parser');
var fs = require('fs');
// var firebase = require('firebase');
var admin = require("firebase-admin");
var renderToString = require("react-dom/server");
var React = require('react');
var renderToString = require('react-dom/server');
var stripe = require("stripe")("[REDACTED]");
var app = Express();
var serviceAccount = require("./serviceAccountKeyJSON");
var multiparty = require('multiparty');
var multer  = require('multer')
var Storage = require('@google-cloud/storage')
var fileType = require('file-type');
var Module = require('module');
var util = require('util');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// Module._extensions['.png'] = function(module, fn) {
//   var base64 = fs.readFileSync(fn).toString('base64');
//   module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
// };
// var something = require('./something');

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


// // parse various different custom JSON types as JSON
// app.use(bodyParser.json({ type: 'application/*+json' }))
 
// // parse some custom thing into a Buffer
// // app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
 
// // parse an HTML body into a string
// app.use(bodyParser.text({ type: 'text/html' }))


process.env.NODE_ENV = 'production';

let PRICE_PREM_X = 4.99;
let PRICE_PREM_Y = 2.99;
let PRICE_PREM_Z = 1.00;


//export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKeyJSON";

// Your Google Cloud Platform project ID
const projectId = 'donate-rcocuzzo-17387568';
//// Creates a client
//const storage = new Storage({
//  projectId: projectId,
//});
//
//
//// Creates the new bucket
//async function createBucket(uid) {
////  var name = '' + uid + '/profilePicture/';
//  await storage.createBucket(uid);
//  console.log(`Bucket ${uid} created.`);
//}


// var allowCrossDomain = function(req, res, next) {
//    res.header('Access-Control-Allow-Origin', "*");
//    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//    res.header('Access-Control-Allow-Headers', 'Content-Type');
//    next();
// }

// app.use(allowCrossDomain);
//some other code

// This is the port we are using. It will default to our System default but, in test mode, it is set to port 1234. This was done so that it doesn't conflict with the default blockchain ports.
var port = process.env.PORT || 1234;


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
  storageBucket: "donate-rcocuzzo-17387568.appspot.com"
});




function log(output) {
    console.log(output)
}

function logn(output) {
    console.log('\n' + output)
}

// Get a reference to the root of the Database
var root = admin.database();
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

let nl = '%0a';  // NEWLINE ?????

var unlocked = false;

/**
 * 
 * NEED TO  DO DISPLAYNAME ON  FRONT  END
 * 
 * 
 */

 
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

makeid = () => {
  var length = 5;
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

validatePhone = (phone) => {
   var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
   return re.test(String(phone));
}

extractPhoneNumber = (uncleaned) => {
  var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
  return cleaned;
}



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

app.post('/postUserInfo', async (req, res) => {
  try {


    var idToken = req.body.params.idToken;
    
      // All fields cleared
      var userJson = {
        n: req.body.params.n,                           // name
        e: req.body.params.e,                           // email
        p: req.body.params.p,                           // plan
        dn: req.body.params.dn,                         // display name
        j: getToday(),                       // timestamp
        z: req.body.params.z                            // phone number
      };

    // Get decoded token
    let decodedToken = await admin.auth().verifyIdToken(idToken);

    var uid = decodedToken.uid;

    let problems = user_info_problems(userJson);


    if (problems == null) {
      log('Info post passed requirements..');
      userJson['dn'] =  makeid();
      // Set user info
      root.ref('/users/'+(uid)+'/i/').set(userJson);
      // set db stuff
      root.ref('/queriable/'+uid+'/dn').set(userJson.dn);
      root.ref('/users/' + uid + '/d/t').set(0);
      log('User info posted.');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end('Successful post!');
    } else {
      console.log('got post user info problems: ' +problems);
      res.writeHead(500, {'Content-Type': 'text/xml'});
      res.end(new Error(problems));
    }

  } catch (e) {
    console.log('Post user info failed with error: ' + e);
    res.writeHead(500, {'Content-Type': 'text/xml'});
    res.end('HANDLED ERR: ' +  e);
  }
});


// app.post('/postUserInfoo', async (req, res) => {
//   try {

//     var idToken = req.body.params.idToken;
//     res.send('got id token!!!!');
//     log('got it!!!!');

//   } catch (e) {
//     console.log('Post user info failed with error: ' + e);
//     res.writeHead(500, {'Content-Type': 'text/xml'});
//     res.end('HANDLED ERR: ' +  e);
//   }
// });

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

app.get('/createStripeUser', async (req,res) => {
  try {
    console.log('\n\nCreating stripe user...')
    var idToken = req.query.idToken;
    var paymentToken = req.query.paymentToken;
    
        // Get decoded token
    let decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (decodedToken) {
      var uid = decodedToken.uid;
      var email = decodedToken.email;

      // Create a Customer:
      const customer = await stripe.customers.create({
        source: paymentToken,
        email: email,
      })
      
        if (customer) {
            let customer_id = customer.id;
            if (uid && customer_id) {
                console.log('sUID: ' + uid)
                console.log('sCustomer ID: ' + customer_id)
                root.ref('/users/' + uid + '/st/id/').set(customer_id)
                root.ref('/stripe_ids/' + customer_id + '/uid/').set(uid);
                res.send(customer_id);
            } else {
                log('Could not create stripe user!')
                res.send(new Error('Could not create payment-backed user!'))
            }
            
        }
        else
            res.send(new Error('Could not create customer!'));

    } else {
        log('No decoded token!')
        res.send(new Error('No decoded token! (Code 1)'));
    }
  } catch  (e) {
    log('No decoded token!')
    res.send(new Error('No decoded token! (Code 2)'));
  }
    

})

// trim the 'remium ' out of each option (for space)
var untrimSelectedOptionName = (opt) =>  {
  opt = opt + '';
  return opt.split(',')[0];
}

// trim the 'remium ' out of each option (for space)
var untrimSelectedOptionAmount = (opt) =>  {
  opt = opt + '';
  return opt.split(',')[1];
}

var planIDForNameAndAmt = (untrimmed_nameAndAmt) => {
  let name = untrimSelectedOptionName(untrimmed_nameAndAmt);
  if (name != 'PX' && name != 'PY' && name != 'PZ' ) {
    console.log('Inavlid plan param (' +name+'): not one of options!')
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
  let amt = untrimSelectedOptionName(untrimSelectedOptionAmount);
  let name = planIDForNameAndAmt(untrimmed_nameAndAmt);
  if (amt == null || name == null || isNaN(amt)) {
    return new Error('Invalid quantityForNameAndAmt parameter! (' + untrimmed_nameAndAmt + ')');
  }
  amt = Number(amt);
  if (name == 'PX') {
      let q = Math.round(amt / PRICE_PREM_X);
      log('User buying '  + q + ' units of ' + name + '..');
      return q;
  }
  else if (name == 'PY') {
    let q = Math.round(amt / PRICE_PREM_Y);
    log('User buying '  + q + ' units of ' + name + '..');
    return q;
    }
  else if (name == 'PZ') {
    let q = Math.round(amt / PRICE_PREM_Z);
    log('User buying '  + q + ' units of ' + name + '..');
    return q;
    }
  else return null;
}


var createSubscription = async (firebase_user_token, planNameAndAmount) => {
    return new Promise( async function(resolve, reject) {
        
        var plan = planIDForNameAndAmt(planNameAndAmount);
        var amt = quantityForNameAndAmt(planNameAndAmount)

        try {

            // Get decoded token
            let decodedToken = await admin.auth().verifyIdToken(firebase_user_token);

            var uid = decodedToken.uid;
            let customer_id = await getStripeCustomerId(uid);

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

                    log('Generated subscription!')
                    root.ref('/users/' + uid + '/sub/').set(subscription.id);
                    root.ref('/queriable/'+uid+'/p').set(planNameAndAmount);
                    resolve(subscription.id)
                  } else {
                    reject(err);
                  }
                }); 
        } catch (err) {
        logn('ERR: ' + err)
        reject(new Error('Payment could not process! Failed with error: ' + err));
        }
    })

}

app.get('/initPayments', async (req,res) => {
    
    var idToken = req.query.idToken;
    var planNameAndAmount = req.query.plan;
    try {
        let subscription = await createSubscription(idToken, planNameAndAmount);
        res.send(subscription);
    } catch (e) {
      res.writeHead(500, {'Content-Type': 'text/xml'});
        res.send(e);
    }
});

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
app.get('/updateJoinedDate', (req, res) => {
    
        var uid = req.query.uid;
        let ref = root.ref('/users/' + uid + '/j');
    
    ref.once('value').then(function(snapshot) {
      if (!(snapshot instanceof String)) {
           ref.set(getToday());
          res.send('Done!');
      } else {
          res.send(snapshot != null);
      }
    }).catch(function(err) {
      res.send(err.message);
    });

    
});


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
 * Gets the active event id
 * @return {[String]} the active event id
 */
var getTotalDonated = async (uid) => {

  let event_ref = root.ref('/users/' + uid + '/d/t');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot) {
      resolve(snapshot.val());
    }).catch(function(err) {
      reject(err.message);
    });
  })

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
    // ref
  let event_ref = root.ref('/users/' + uid + '/v/' + eventId + '/don');

  return new Promise( function (resolve, reject) {

    event_ref.once('value').then(function(snapshot, err) {
      if (err || !snapshot.val()) {
        resolve(false);
        } else {
            resolve(true)
        }
    });
  })
}

app.post('/event_log', async function(request, response) {
  // Retrieve the request's body and parse it as JSON:
    const event_json = request.body;
    if (event_json.type == 'charge.succeeded') {
        try {
            
            log('charge succeeded!');

            let cust_id = event_json.data.object.customer;
            let amountContributed = Number(event_json.data.object.amount);
            
            log('found customer id and the amount they contributed!');

            
            let uid = await getFirebaseUserFromCustomerId(cust_id);
            let active_event = await getActiveEventId();
            
            log('found uid and active event!');

            let alreadyProcessed = await haveProcessedUserPaymentForEvent(uid, active_event);
            
            log('finished checking for already processed!');
            
            if (!alreadyProcessed) {
                let incomeForEvent = await getTotalIncomeForEvent(active_event);
            incomeForEvent = Number(incomeForEvent);
            incomeForEvent += amountContributed;
            
            let totalDonated = await getTotalDonated(uid);
            totalDonated = Number(totalDonated);
            totalDonated += amountContributed;
            
            log('Adding ' + amountContributed + ' to user: ' + uid + '\n  for successful charge for event ' + active_event);

            // Set amount that user donated
            root.ref('/users/' + uid + '/v/' + active_event + '/don/').set(amountContributed)
            
            root.ref('/users/' + uid + '/d/t').set(totalDonated)

            root.ref('/db/events/' + active_event + '/ttl/').set(incomeForEvent);

            log('Finished processing charge!');
                
            response.send("Done processing!");
                
            } else {
                log('Caught duplicate for user ' + uid + ' on event ' + active_event);
                response.send("Not sure it worked!!!");
            }

            
        } catch (e) {
            
             response.send(e)
            
        }
    } else if (event_json.type == 'payout.created') {
            
        try {
            console.log('Payout created')
            let active_event = await getActiveEventId();
            let winningOption = await getWinningOptionForEvent(active_event);
            
            root.ref('/db/events/' + active_event + '/w').set(winningOption);

            // ------- UPATE WINNING OPTION AS WINNING OPTION ------- // 
            
            let nextEvent = await mostRecentlyAddedEvent();
            
            root.ref('/db/active_event/').set(nextEvent.id);

            notifyPeople();
            
            response.send('Good!');
            
        } catch (e) {
            
             response.send(e)
            
        }
        
    }else {
        response.send("You're good! Nothing happened though!");
    }
    
});
    

app.get('/changePaymentSource', async (req,res) => {
    console.log('Changing stripe user source payment...')
    var idToken = req.query.idToken;
    var paymentToken = req.query.paymentToken;
    
    try {
       
        // Get decoded token
        let decodedToken = await admin.auth().verifyIdToken(idToken);

        if (decodedToken) {

          var uid = decodedToken.uid;
          var email = decodedToken.email;
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
            
        } else {
            log('No decoded token!')
            res.send(new Error('No decoded token!'));
        }

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
        let decodedToken = await admin.auth().verifyIdToken(idToken);

        if (decodedToken) {
            
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
                      log('ErrorX: ' + err)
                    res.send(err);
                  }
                }); 
            
        } else {
            log('No decoded token!')
            res.send(new Error('No decoded token!'));
        }

    } catch(e) {
        res.send('Server error: ' + e);
    }
    

    
})
    
        
        
app.get('/deleteUser', async (req,res) => {

  log('POST Delete User..');

    var idToken = req.query.idToken;

      log('IDT: ' + idToken);

        // Get decoded token
        let decodedToken = await admin.auth().verifyIdToken(idToken);

        if (decodedToken) {

          log('DELETE authenticated..');
            
          var uid = decodedToken.uid;
          getStripeCustomerId(uid).then(function(cust_id){

            log('OK Got stripe info..');

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
                        console.log("Successfully deleted user");
                        res.send("Successfully deleted user");
                        return;
                      })
                      .catch(function(error) {
                        console.log("Error deleting user:", error);
                        res.send(error);
                        return;
                      });
                } else {

                    res.send(new Error('Could not delete! (Stripe endpoint)'))
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
                console.log("Successfully deleted user");
                res.send("Successfully deleted user");
                return;
              })
              .catch(function(error) {
                console.log("Error deleting user:", error);
                res.send(error);
                return;
              });
          });
          
        } else {
            log('No decoded token!')
            res.send(new Error('No decoded token!'));
            return;
        }             
         
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
            log('hv: ' + hasVoted)
            if (!hasVoted) {
                root.ref('/db/events/' + eventId + '/o/' + voteId+'/vrs/').push(userId)
                root.ref('/users/' + userId + '/v/' + eventId + '/c').set(voteId);

                logn("Attempting to cast vote on { " + eventId + ", " + voteId + " }...");

                /*
                    Cast vote to the place
                */

                let vote_ref = root.ref('/db/events/'+eventId+'/o/'+voteId+'/ttl');
                let votes = 0;
                vote_ref.once('value').then(function(snapshot, err) {
                    if (err) { 
                        logn("Error on ttl lookup: " + err);
                        reject(err)
                     }
                    if (snapshot) {
                      votes = Number(snapshot.val())
                    }
                    votes++;
                    vote_ref.set(votes);
                    logn("Set votes to " + votes);

                    /*
                        Update event's total as well
                    */

                    let event_ref = root.ref('/db/events/'+eventId+'/o/ttl');
                    votes = 0;
                    event_ref.once('value').then(function(snapshot, err) {
                        if (err) { 
                            logn("Error on ttl lookup: " + err);
                            reject(err)
                        }
                        if (snapshot) {
                        votes = Number(snapshot.val())
                        }
                        votes++;
                        event_ref.set(votes);
                        resolve(true)   
                    });

                });

                
            } else {
                logn("\nUser has already voted.")
                reject(new Error('It seems you have already voted'));
            }

        } catch (e) {
            console.log(e);
            reject(e);
        }
        
    })
}

app.get('/castVote', async (req,res) => {
    
    var idToken = req.query.idToken;
    var voteId = req.query.voteId;
    var eventId = req.query.eventId;
    
    try {

        // Get decoded token
        let decodedToken = await admin.auth().verifyIdToken(idToken);

        if (decodedToken) {
            
          var uid = decodedToken.uid;
          
          let castedVote = await castVote(eventId, voteId, uid);
            
          res.send(castedVote);
          
        } else {
            log('No decoded token!')
            res.send(new Error('No decoded token!'));
        }
    } catch(e) {
        console.log(e.message);
        res.send('Could not cast your vote!');
    }
             
         
})

var getRandomEmail = () => {
    var randomString = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    var emailTag = '@gmail.com';
    return randomString + emailTag;
}

// eventId = '-LUZFB34udESrmnBrQHn'
// voteId = ''
// root.ref('/db/events/'+eventId+'/o/'+voteId+'/ttl').set(999);

app.listen(port, () => console.log('Server running on port '+ port + '!\n'))
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

let DB = utils.DB;
let PLAN = utils.PLAN;

function Customer(cid, amt_contributed) {
  this.CustomerId = cid;
  this.AmountContributed = '$' + amt_contributed;
}


// Get a reference to the root of the Database
var root = utils.root; //admin.database();

app.post('/sms', async (req, res) =>  {
    var user_vote = req.body.Body;
    var msg_from = req.body.From;

    log('Got user reply info..');

    utils.cast_texted_vote(user_vote, msg_from).then((success_response) => {

      const twiml = new MessagingResponse();
      twiml.message('Vote submitted!');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }).catch((issue) => {
      log('Caught SMS Error: ' + issue);
      const twiml = new MessagingResponse();
      twiml.message('Sorry, we couldn\'t process your vote! Please double-check that the option you\'ve selected is valid!');
      res.writeHead(500, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    })
})


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



// Get the priveledges of a user
app.get('/eventPriviledges', (req, res)  => {

    var idToken = req.query.idToken;

    if (idToken == null)  { res.send(false); return; }

    utils.get_decoded_token(idToken).then((decodedToken) => {
      var uid = decodedToken.uid;

      utils.canPostEvents(uid).then(function(canPost) {
        if (canPost != null)
            res.send( canPost );
        else
            res.send(false);
      }).catch(() => {
          res.send(false);
      });
    }).catch(e => {
      res.send(false);
    });

});

var randstring = (l) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < l; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

var check_string = (s) => {
  let res = s && typeof s === 'string' && s.length > 0 && s.length < 50;
  // log('CHECK STRING: ' + s + ' = ' + res);
  return res;
}
app.post('/initiate_new_user', async (req, res) => {
  var send_status = (e) =>  res.status(571).send({ message: e });
  if (req.body == null || req.body.params == null) { send_status('Error: invalid params.');return; }
  let params = req.body.params;
  var password = req.body.params.pw; // note pw, not password
  var paymentToken = req.body.params.paymentToken;
  // run checks -> NOTE: plan & token check should be better.
  if (!(check_string(params.n) && check_string(params.e) && check_string(params.p)
        && check_string(params.z) && check_string(params.pw) && paymentToken)) { send_status('Error: invalid params.');return; }

  var usr = {
    n: req.body.params.n,                           // name
    e: req.body.params.e,                           // email
    p: req.body.params.p,                           // plan
    dn: randstring(7),                              // display name
    j: utils.getToday(),                            // timestamp
    z: req.body.params.z                            // phone number
  };

  console.log('attempting to Init User with \n\tName: ' + usr.n
      + ' \n\tEmail: ' + usr.e
      + ' \n\tPass: ' + password
      + ' \n\tPhone: ' + usr.z
      + ' \n\tPlan: ' + usr.p
      + ' \n\tDisp Name: ' + usr.dn
      + ' \n\tToken: ' + paymentToken
      + ' \n\W/ Stamp: ' + usr.j
      );

  try {
    let result = await utils.initiate_new_user(usr.e, password, usr, paymentToken);
    res.send(result);
  } catch (e) {
    err_log('RESOLVE-> ' + e);
    if (e !== 'USER_EXISTS') { // created account, we should delete the created acct

        admin.auth().getUserByEmail(req.body.params.e)
          .then( (userRecord) => {
                  utils.deleteUser(userRecord.uid).then(() => send_status(e))
                    .catch(() => send_status(e));
            })
          .catch((error) => {
               console.log('Error fetching user data:', error);
               send_status(e);
           });

       };
    }

});

// Get the priveledges of a user
app.post('/createEvent', (req, res)  => {

    if (req.body == null) res.status(401).send("Invalid input");

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


app.get('/totalUsersForEvent', async function(req, res) {
  if (req == null || req.query == null) { res.send(new Error('invalid request')); return;}
  utils.getTotalUsersForEvent(req.query.eventId).then((total) => res.send(total)).catch((e) => res.send(e));
});

app.get('/get_plan_stats', async (req,res) => {

  if (req == null || req.query == null) { res.send(new Error('invalid request')); return;}
  utils.get_plan_stats().then((obj) => res.send(obj)).catch((e) => res.send(e));
});

app.post('/event_log', async function(request, response) {
    if (request ==  null || request.body == null) { response.send("Sorry, bad input!"); return;  }
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

            let successful_charge = await utils.customer_charged_successfully(cust_id, amountContributed);

            response.send(successful_charge);

        } catch (e) { err_log(e); response.send(e); return; }
    } else if (event_json.type == 'payout.created') {

      utils.performMonthlyRollover().then(function(out) { res.send(out); }).catch(function(e) {res.send(e);});

    } else if (event_json.type == 'charge.failed') {

      err_log('charge failed')

      let object = event_json.data.object;

      let cust_id = object.customer;
      try {
        let uid = await utils.getFirebaseUserFromCustomerId(cust_id);
        DB.User_prevChargeStatus(uid).set('FAILED');
        response.send('ok - failed.')
      } catch (e) {
        err_log('Could not find customer');
        response.send('Could not find customer');
      }

    }

    else { response.send("ok");}

});


app.post('/changePaymentSource', async (req,res) => {
    console.log('Changing stripe user source payment...')
    if (!req.body ) { err_log('Invalid inputs.'); res.status(571).send('Invalid params.'); return; }

    var idToken = req.body.tokenId;
    var paymentToken = req.body.paymentToken;

    if (!idToken || !paymentToken ) { err_log('Invalid inputs.'); res.status(571).send('Invalid params.'); return; }

    ok_log('Valid inputs.')

    try {

        // Get decoded token
        let decodedToken = await utils.get_decoded_token(idToken);

        ok_log('Decoded auth token.')

        var uid = decodedToken.uid;
        var cust_id = await utils.getStripeCustomerId(uid);

        ok_log('Got stripe customer id.');


          let x = await stripe.customers.createSource(cust_id, {
            source: paymentToken
          });

          ok_log('created source with pay token.');

          // Perform update
          stripe.customers.update(cust_id, {
            default_source: x.id
          }, function(err, resp) {
                if (resp) {
                    ok_log('Successfully updated pay source'); 
                    res.send(resp)
                } else {
                    err_log(err)
                    res.send(err)
                }
          });
    } catch(e) {
      err_log(e);
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

app.post('/change_plan', async (req,res) => {
    log_group_begin('Plan Change');

    if (!req.body ) { res.status(571).send('Invalid params.'); log_group_end(); return; }

    var idToken = req.body.idToken;
    var planName = req.body.plan;

    if (!idToken || !planName ) { res.status(571).send('Invalid params.'); log_group_end(); return; }

    var planId = utils.planIDForNameAndAmt(planName);

    try {

        // Get decoded token
        let decodedToken = await utils.get_decoded_token(idToken);

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

                ok_log('Got subscription!')
                root.ref('/users/' + uid + '/sub').set(subscription.id);

                root.ref('/users/' + uid + '/i/p/').set(planName);
                root.ref('/queriable/' + uid + '/p').set(planName);


                ok_log('Plan Change complete!')
                res.send(subscription)
                log_group_end();
                
              } else {
                  err_log(err);
                  res.send(err);
                  log_group_end();
              }
              });

    } catch(e) {
        res.send('Server error: ' + e);
        log_group_end();
    }

})

app.post('/deleteUser', async (req,res) => {

  var idToken = req.body.idToken;

  log_group_begin('POST Delete User..');
  try {
    // Get decoded token
    let decodedToken = await utils.get_decoded_token(idToken);

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
   return ((await utils.DB.User_choiceForEvent(userId, eventId).fetch()) !== null);
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
          let user_payment_succeeded = await utils.getPrevChargeStatus(userId);
          ok_log('User payment clean')

          DB.Event_votersForOption(eventId, voteId).push(userId)
          DB.User_choiceForEvent(userId, eventId).set(voteId);

          ok_log('User payment clean')

          // logn("Attempting to cast vote on { " + eventId + ", " + voteId + " }...");

          /*  Cast vote to the place  */

          let event_option_votes = await utils.DB.Event_optionTotalVotes(eventId, voteId).fetch();

          ok_log('got total option votes -> ' + event_option_votes)

          event_option_votes = Number(event_option_votes) + 1;
          DB.Event_optionTotalVotes(eventId, voteId).set(event_option_votes);

          ok_log('updated total option votes -> ' + event_option_votes)

          /*  Update event's total as well  */

          let event_total_votes = await utils.DB.Event_overallTotalVotes(eventId).fetch();

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

let MAX_N_OPTIONS = 3;
app.post('/castVote', async (req,res) => {
    if (!(req && req.body && req.body.params)) { res.status(571).send({message: 'invalid params'}); return; }
    
    var idToken = req.body.params.idToken;
    var voteId = req.body.params.voteId;
    var eventId = req.body.params.eventId;

    if (!check_string(eventId) || typeof voteId !== 'number' || voteId >= MAX_N_OPTIONS || !idToken)  { res.status(571).send({message: 'invalid params'}); return; }
    

    try {

      let decodedToken = await utils.get_decoded_token(idToken);
      let castedVote = await castVote(eventId, voteId, decodedToken.uid);
      res.send(castedVote);

    } catch(e) {
        err_log(e);
        res.send(572, 'Already voted')
    }
})

app.get('/create_test_event', async (req,res) => {

  if (utils.TEST_MODE == true) {
    root.ref('/db/events/').push(utils.make_test_event());
  }
})

app.post('/create_event', async (req, res) => {
    if (req && req.body) { // legit post
        if (req.body.ADMIN_KEY == 'hi_ryan_here'  && req.body.is_preexisting != null && req.body.is_preexisting != '') {
            var pre = (req.body.is_preexisting == 'true' || req.body.is_preexisting == true);
            pre = !pre; // Naming on form is inverted
            log('Got ' + req.body.is_preexisting + ' -> pre = ' + pre);
            try {
                let created = await utils.create_new_event(req.body, pre);
                res.status(200).send(created);
            } catch (e) {
                assert.fail(e);
                res.status(500).send(created);
            }
        } else res.status(401).send('User not authorized.');
    } else res.status(501).send('Bad input.');
});

app.listen(port, () => console.log('Server running on port '+ port + '!\n'))

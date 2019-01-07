var Express = require('express');
var axios = require('axios');
var https = require('https');
var bodyParser = require('body-parser');
var fs = require('fs');
var firebase = require('firebase');
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

Module._extensions['.png'] = function(module, fn) {
  var base64 = fs.readFileSync(fn).toString('base64');
  module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};
var something = require('./something');

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var upload = multer({ dest: 'uploads/' })

// General setup
app.use( function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});





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


//var allowCrossDomain = function(req, res, next) {
//    res.header('Access-Control-Allow-Origin', "*");
//    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//    res.header('Access-Control-Allow-Headers', 'Content-Type');
//    next();
//}
//
//app.configure(function() {
//    app.use(allowCrossDomain);
//    //some other code
//});
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

var canPostEvents = async (uid) => {
    
  var event_ref = root.ref('/users/' + uid + '/canPostEvents');
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
        root.ref('/users/' + uid + '/images/profilePicture').once('value').then (function(snap) {
            if (snap && snap.val())
                resolve(snap.val())
            else
                reject('No stripe customer id!')
        })
    })
}

var getStripeCustomerId = async (uid) => {
    return new Promise( function(resolve, reject) {
        root.ref('/users/' + uid + '/payment/customer_id').once('value').then (function(snap) {
            if (snap && snap.val())
                resolve(snap.val())
            else
                reject('No stripe customer id!')
        })
    })
}

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
    console.log('Creating stripe user...')
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
                console.log('UID: ' + uid)
                console.log('Customer ID: ' + customer_id)
                root.ref('/users/' + uid + '/payment/customer_id/').set(customer_id)
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
        res.send(new Error('No decoded token!'));
    }

})


var planIDForName = (name) => {
    log('pIDforName gets ' + name)
    if (name) {
        if (name == 'Premium X') {
            return 'plan_EFkZOvEIVafjem';
        }
        else if (name == 'Premium Y') {
            return 'plan_EFkayLyiJZhC3a';
        } else if (name == 'Premium Z') {
            return 'plan_EFkawavkpzywuN';
        }  
        else {
            console.log('Inavlid plan param: not one of options!')
            return new Error('Invalid plan parameter!');
        }
    } else {
        console.log('Inavlid plan param: no input name!')
        return new Error('Invalid plan parameter!');
    }
}

var createSubscription = async (firebase_user_token, planName) => {
        return new Promise( async function(resolve, reject) {
            
            var plan;
            if (planName) {
                if (planName == 'Premium X') {
                    plan = 'plan_EFkZOvEIVafjem';
                }
                else if (planName == 'Premium Y') {
                    plan = 'plan_EFkayLyiJZhC3a';
                } else if (planName == 'Premium Z') {
                    plan = 'plan_EFkawavkpzywuN';
                }  
                else {
                    console.log('Inavlid plan param!')
                    reject(new Error('Invalid plan parameter!'));
                }
            }


            try {

                // Get decoded token
                let decodedToken = await admin.auth().verifyIdToken(firebase_user_token);

                if (decodedToken) {
                    var uid = decodedToken.uid;
                    let customer_id = await getStripeCustomerId(uid);

                      // Create the user subscription
                      stripe.subscriptions.create({
                          customer: customer_id,
                          items: [
                            {
                              plan: plan,
                            },
                          ],
                        }, {
                          stripe_account: "[REDACTED]",
                        }, function(err, subscription) {
                          if (subscription) {

                            log('Got subscription!')
                            root.ref('/users/' + uid + '/subscription/').set(subscription);

                            resolve(subscription)
                          } else {
                              log('ErrorX: ' + err)
                            reject(err);
                          }
                        }); 


                } else {
                    log('No decoded token!')
                    reject(new Error('No decoded token!'));
                }

            } catch (err) {
            logn('ERR: ' + err)
            reject(new Error('Payment could not process!'));
        }
        })
    
}

app.get('/initPayments', async (req,res) => {
    
    var idToken = req.query.idToken;
    var planName = req.query.plan;
    try {
        let subscription = await createSubscription(idToken, planName);
        res.send(subscription);
    } catch (e) {
        res.send(e);
    }
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

  let event_ref = root.ref('/db/' + eventId + '/total/');

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

  let event_ref = root.ref('/users/' + uid + '/donation_stats/total_donated');

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

/**
 * Gets the snapshot for an event
 * @param  {[String]} eventId [event id]
 * @return {[Object]} snapshot
 */
var eventSnapshot = async (eventId) => {

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

var getOptionsDispersion = async (eventId) => {
  return new Promise ( async function(resolve, reject) {
   try {
       let active_event_id = await getActiveEventId();
       let eventSnapshot = await eventSnapshot(active_event_id);
       let event = {
          title: event["title"],
          summary: event["summary"],
          options: event["options"],
          id: event['id']
        }
        var objArray = [];
        if (event) {

            Object.keys(event.options).forEach(function(key) {
                var votes = event.options[key].voters.length;
                var opt = {
                    votes: votes,
                    id: key
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
          title: event["title"],
          summary: event["summary"],
          options: event["options"],
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



app.post('/event_log', async function(request, response) {
  // Retrieve the request's body and parse it as JSON:
    const event_json = request.body;
    if (event_json.type == 'charge.succeeded') {
        try {

            let cust_id = event_json.data.object.customer;
            let amountContributed = Number(event_json.data.object.amount);
            log(cust_id);
            logn(amountContributed)
            log('ok')
            
            let uid = await getFirebaseUserFromCustomerId(cust_id);
            let active_event = await getActiveEventId();

            log('ok2')

            let incomeForEvent = await getTotalIncomeForEvent(active_event);
            incomeForEvent = Number(incomeForEvent);
            incomeForEvent += amountContributed;
            
            let totalDonated = await getTotalDonated(uid);
            totalDonated = Number(totalDonated);
            totalDonated += amountContributed;
            
            log('Adding ' + amountContributed + ' to user: ' + uid + '\n  for successful charge for event ' + active_event);

            // Set amount that user donated
            root.ref('/users/' + uid + '/votes/' + active_event + '/contribution/').set(amountContributed)
            
            root.ref('/users/' + uid + '/donation_stats/total_donated').set(totalDonated)

            root.ref('/db/events/' + active_event + '/total/').set(incomeForEvent);

            log(event_json);
            
        } catch (e) {
            
             res.send(e)
            
        }
    } else if (event_json.type == 'payout.created') {
            
        try {

            let active_event = await getActiveEventId();
            let winningOption = await getWinningOptionForEvent(active_event);
            
            root.ref('/db/events/' + active_event + '/winningOption').set(winningOption);

            // ------- UPATE WINNING OPTION AS WINNING OPTION ------- // 
            
            let nextEvent = await mostRecentlyAddedEvent();
            
            root.ref('/db/active_event/').set(nextEvent.id);
            
            res.send('Good!');
            
        } catch (e) {
            
             res.send(e)
            
        }
        
    }else {
        log('NON-CHARGE: ' + JSON.stringify(event_json));
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
            
            log(x.id);
            logn('ABOVE WAS PAYMENT SOURCE')
            
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
        let ref = root.ref('/users/' + uid + '/subscription/id');
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
    
    var planId = planIDForName(planName);
    
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
                    root.ref('/users/' + uid + '/subscription/').set(subscription);

                    root.ref('/users/' + uid + '/info/plan/').set(planName);
                    root.ref('/queriable/' + uid + '/info/plan/').set(planName);

                    
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
    var idToken = req.query.idToken;
    
    try {

        // Get decoded token
        let decodedToken = await admin.auth().verifyIdToken(idToken);

        if (decodedToken) {
            
          var uid = decodedToken.uid;
          var cust_id = await getStripeCustomerId(uid);
            
          stripe.customers.del("cus_EGYkcrrtYpP9Wa",
              function(err, confirmation) {
                if (confirmation) {
                    
                    // Clear firebase references
                    root.ref('/users/' + uid + '/').set(null);
                    root.ref('/stripe_ids/' + cust_id + '/').set(null);
                    // Delete user from auth
                    admin.auth().deleteUser(uid)
                      .then(function() {
                        console.log("Successfully deleted user");
                        res.send("Successfully deleted user");
                      })
                      .catch(function(error) {
                        console.log("Error deleting user:", error);
                        res.send(error);
                      });
                } else {
                    res.send(new Error('Could not delete! (Stripe endpoint)'))
                }
              }
            );

          
        } else {
            log('No decoded token!')
            res.send(new Error('No decoded token!'));
        }
    } catch(e) {
        res.send('Server error: ' + e);
    }
             
         
})

var getRandomEmail = () => {
    var randomString = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    var emailTag = '@gmail.com';
    return randomString + emailTag;
}



app.listen(port, () => console.log('Server running on port '+ port + '!\n'))
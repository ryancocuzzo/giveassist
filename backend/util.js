var assert = require('assert');
var admin = require("firebase-admin");
/*
TEST: [REDACTED]
LIVE: [REDACTED]

*/
var serviceAccount = require("./serviceAccountKeyJSON");

/*
TEST: [REDACTED]
LIVE: [REDACTED]

*/
// var stripe = require("stripe")("[REDACTED]"); // test
var stripe = require("stripe")("[REDACTED]"); // live
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
  storageBucket: "donate-rcocuzzo-17387568.appspot.com"
});

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
  log('amt is ' + amt);
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

// ____________________________________________________________________________________________________________________________________________
// ____________________________________________________________________________________________________________________________________________


module.exports = {
    root: root,
    randomNumber: function() {return rNumber(); },
    user_info_problems: function(json) { return user_info_problems(json); },
    postUserInfo: function (n,e,p,dn,z, uid) {

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
            root.ref('/users/' + uid + '/d/t').set(untrimSelectedOptionAmount(p));
            // log('User info posted.');
            return true;
        } else {
            return false;
        }
    },
    deleteUser: async function (uid) {
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
      
    },
    createStripeUser: async function (paymentToken, email, uid) {
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
    },
    executeCreateSubscription: async function (uid, planNameAndAmount) {
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
          reject(new Error('Payment could not process! Failed with error: ' + err));
          }
      })
  
  },
    getUserInfo:  async function (uid) {
    return new Promise( function(resolve, reject) {
      let ref = root.ref('/users/' + uid + '/i/');
  
        ref.once('value').then (function(snap) {
            if (snap && snap.val())
                resolve(snap.val())
            else
                resolve(null)
        })
    })
  },
  userExists: async function (uid) {
    return new Promise( function(resolve, reject) {
        admin.auth().getUser(uid)
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        // console.log('Successfully fetched user data:', userRecord.toJSON());
        resolve(userRecord);
      })
      .catch(function(error) {
        // console.log('No user data to fetch, user does not exist');
        resolve(null);
      });
    })
  }
    
};
  
  
  
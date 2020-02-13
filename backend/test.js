
// var assert = require('assert');
var admin = require("firebase-admin");
var utils = require('./util.js');
let chai = require('chai');
var clc = require("cli-color");
var stripe = utils.stripe;
var assert = chai.assert;
var expect = chai.expect;

if (utils.TEST_MODE == false) { throw new Error("Hey we gotta run in test mode!"); }


// Get a reference to the root of the Database
var root = utils.root;

function log(output) {
  console.log(output)
}
function logn(output) {
  console.log('\n' + output)
}

function err_log(output) {
logn(clc.red.bold('Error ') + output);
}


var randstring = (l) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < l; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function unformalized_new_test_event() {
    let json = {
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
        "ttl" : null,
        "tu" : null
    };
    let new_json = {
        "id": json.id,
        "gen_summary": json.s,
        "gen_title": json.t,
        "gen_num_users": json.tu,
        "gen_revenue_generated": json.ttl,
        "a_link": json.o.a.link,
        "b_link": json.o.b.link,
        "c_link": json.o.c.link,
        "a_org": json.o.a.org,
        "b_org": json.o.b.org,
        "c_org": json.o.c.org,
        "a_title": json.o.a.t,
        "b_title": json.o.b.t,
        "c_title": json.o.c.t,
        "a_summary": json.o.a.s,
        "b_summary": json.o.b.s,
        "c_summary": json.o.c.s,
    };
    return new_json;
}



function delay(interval)
{
   return it('should delay', done =>
   {
      setTimeout(() => done(), interval)

   }).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
}


// set up initial values

let name = 'John Userson';
let email = 'johnUserson' + randomSnippet() + '@gmail.com';
let phoneNumber = '+11234567' + utils.randomNumber(); // 6 + r(3)
let password = 'Password123';
let displayName = 'TEST John Userson 123';
let plan = 'PZ,9.03';

    /*   1    */

var user_record = null;

var visit = async (dbstring) => {
    return new Promise(async function(resolve, reject) {
        root.ref(dbstring).once('value', function(snap) {
        if (snap && snap.val()) {
            console.log('\Visited JSON: ' + JSON.stringify(snap.val()));
            console.log(snap.ref.toString())
            resolve(snap.val())
        } else
            reject(new Error('Path ' + dbstring + ' does not exist in the database.'))
        })
    })
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function prettify(json) { return JSON.stringify(json, null, 2); }


describe('Process Customer Charge Test Suite',  function() {
    this.timeout(0);                                                                                                                                  log('\n');                                                                                                                                 log('\n');
    let sample_user_uid = "cATSYis1ldZvRT4L5geR6Q0Vcym1";
    let sample_amount_donated = 20; // USD
    var result_id;
    
        it('gets the customer\'s stripe id', async function() {
           try {
              result_id = await utils.getStripeCustomerId(sample_user_uid);
              let test_value = result_id != null;
              expect(test_value).to.be.true;
              return 'ok';
           } catch (e) {
               assert.fail(e);
               return 'oh';
           }
       });

      it('gets the user\'s charged info', async function() {
          try {
              let resp = await utils.customer_charged_successfully(result_id, sample_amount_donated);
                  console.log(prettify(resp));
              let test_value = resp != null;
              expect(test_value).to.be.true;
              return 'ok';
          } catch (e) {
              assert.fail(e);
              return 'oh';
          }
      });
});











describe('Sign Up Flow Test Suite', async function() {                                                                                                                                      log('\n');

  this.timeout(0);


    /*   1    */

    var card_token;

      it('creates the stripe payment token', function() {
        return new Promise(async function (resolve, reject) {
          try {
              card_token = await stripe.tokens.create({
                card: {
                  number: '4242424242424242',
                  exp_month: 12,
                  exp_year: 2020,
                  cvc: '123'
                }
              })
                let test_value = card_token != null;
                expect(test_value).to.be.true;
                resolve(card_token);
          } catch (e) {
            assert.fail('ISSUE: ' + e);
            reject(e);
          }
        })
      });

   /*   2    */

   let result_uid;

  it('initializes a new fully-capable user', async function() {
      return new Promise(async function (resolve, reject) {
        try {

          var usr = {
            n: name,                                 // name
            e: email,                                // email
            p: plan,                                 // plan
            dn: displayName,                         // display name
            z: phoneNumber                           // phone number
          };


          // create user
          result_uid = await utils.initiate_new_user(email,password,usr,card_token.id);
          // log(result_uid);
          let test_value = result_uid != null;
          expect(test_value).to.be.true;
          resolve(user_record);
        } catch (e) {
          assert.fail('Did not create user -> ' + e);
          reject(e);
        }
    })
  });

  it('deletes the test user\'s data', async function() {
    this.timeout(0);
    return new Promise(async function (resolve, reject) {

      if (result_uid == null) { resolve('Could not delete -> no user info to delete'); return; }

      try {

        // delete user
        await utils.deleteUser(result_uid);
        // log('Delete executed.');

      } catch (e) {
        // log('Could not find a user to delete!');
        assert.fail('Could not find a user to delete! -> ' + e);
        reject(e);
      }

      try {

        // verify user's deleted - auth
        let user_exists = await utils.userExists(result_uid);
        if (user_exists == null)
          assert.ok('User auth has been successfully deleted');
        else
          assert.fail('ISSUE: User auth Still exists.');
      } catch (e) {
        assert.fail('ISSUE: User auth Still exists. -> ' + e);
      }

      try {

        // verify user's deleted - db
        let user_info_fetched = await utils.getUserInfo(result_uid);
        if (user_info_fetched == null) {
           assert.ok('User info has been successfully deleted');
           resolve('User info has been successfully deleted');
        }
        else {
          console.table(user_info_fetched);
          assert.fail('ISSUE: User info Still exists.');
          reject('ISSUE: User info Still exists.');
        }
      } catch {
        assert.ok('User info has been successfully deleted');
        resolve('User info has been successfully deleted');
      }
      });
  });


});


describe('Utility Function tester', async function() {                                                                                                                                      log('\n');

  this.timeout(0);

      it('finds the plan stats', function() {
        return new Promise(async function (resolve, reject) {
          try {
              let plan_stats = await utils.get_plan_stats();
                let test_value = plan_stats != null && plan_stats.counts != null  && plan_stats.recents != null;
                expect(test_value).to.be.true;
                resolve(plan_stats);
          } catch (e) {
            err_log(e);
            assert.fail('ISSUE: ' + e);
            reject(e);
          }
        })
      });

});


describe('Monthly rollover test', async function() {                                                                                                                                      log('\n');

  this.timeout(0);

      it('performs the monthly rollover', function() {
        return new Promise(async function (resolve, reject) {
          try {
              let rollover_response = await utils.performMonthlyRollover();
                let test_value = rollover_response != null;
                expect(test_value).to.be.true;
                resolve(test_value);
          } catch (e) {
            err_log(e);
            assert.fail('ISSUE: ' + e);
            reject(e);
          }
        })
      });

});


describe('Create New Event Test Suite',  function() {
    this.timeout(0);                                                                                                                                  log('\n');                                                                                                                                 log('\n');
    let new_event_req_body = unformalized_new_test_event();
    let is_preexisting = false;
       it('creates a new event', async function() {
           try {
               let res = await utils.create_new_event(new_event_req_body, is_preexisting); // ISSUE. Remove line & it posts the data (but never terminates test)
               assert.isOk('Ok','Ok');
               return 'ok';
           } catch (e) {
               assert.fail(e);
               reject('oh');
               return 'oh';
           }
       });

      it('creates a pre-existing event', async function() {
          try {
              let res = await utils.create_new_event(new_event_req_body, true); // ISSUE. Remove line & it posts the data (but never terminates test)
              assert.isOk('Ok','Ok');
              return 'ok';
          } catch (e) {
              assert.fail(e);
              reject('oh');
              return 'oh';
          }
      });
});
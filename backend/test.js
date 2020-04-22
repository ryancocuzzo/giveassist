
// var assert = require('assert');
var admin = require("firebase-admin");
var utils = require('./util.js');
let chai = require('chai');
var clc = require("cli-color");
var logging = require('./logging.js');
var helpers = require('./helpers.js');
var sms = require('./SMS.js');
var createvent = require('./CreateEvent.js');
let plansjs = require('./plans.js');
var testdata = require('./testdata.js');
var stripe = utils.stripe;
var assert = chai.assert;
var expect = chai.expect;

// get rid of "unhandled" description
// process.on('unhandledRejection', () => {});


if (utils.TEST_MODE == false) { throw new Error("Hey we gotta run in test mode!"); }


// Get a reference to the root of the Database
var root = utils.root;

var log = logging.log;
var err_log = logging.err_log;
var ok_log = logging.ok_log;
var table_log = logging.table_log;
var group_begin = logging.log_group_begin;
var group_end = logging.log_group_end;
var prettify = logging.prettify;


// function delay(interval)
// {
//    return it('should delay', done =>
//    {
//       setTimeout(() => done(), interval)
//
//    }).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
// }
//
//
// const sleep = (milliseconds) => {
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }


// set up initial values

let name = 'John Userson';
let email = 'johnUserson' + helpers.randstring(3) + '@gmail.com';
let phoneNumber = '+11234567' + helpers.rNumber(); // 6 + r(3)
let password = 'Password123';
let displayName = 'TEST John Userson 123';
let plan = 'PZ,9.0';

/*   1    */

var user_record = null;



function prettify(json) { return JSON.stringify(json, null, 2); }










let result_uid;


describe('Sign Up Flow Test Suite', async function() {                                                                                                                                      log('\n');

this.timeout(0);


/*   1    */

// var card_token;
var card_token = { id: 'tok_visa' };

// it('creates the stripe payment token', function() {
//   return new Promise(async function (resolve, reject) {
//     try {
//         card_token = await stripe.tokens.create({
//           card: {
//             number: '4242424242424242',
//             exp_month: 12,
//             exp_year: 2020,
//             cvc: '123'
//           }
//         })
//           let test_value = card_token != null;
//           expect(test_value).to.be.true;
//           resolve(card_token);
//     } catch (e) {
//       assert.fail('ISSUE: ' + e);
//       reject(e);
//     }
//   })
// });

/*   2    */


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
            let test_value = result_uid != null;
            expect(test_value).to.be.true;
            resolve(user_record);

        } catch (e) {
            assert.fail('Did not create user -> ' + e);
            reject(e);
        }
    })
});


});

describe('Functions Test Suite', async function() {                                                                                                                                      log('\n');

this.timeout(0);

    it('submits a vote for the user', async function() {
        return new Promise(async function (resolve, reject) {
            let ev_id, snap, opt_index;


            try {

                ev_id = await utils.getActiveEventId();
                snap = await utils.eventSnapshot(ev_id);
                opt_index = 0;
                // let opt = Object.keys(snap.o)[opt_index]; // m
                ok_log('got voting option ' + opt_index);
                // cast vote
                let casted = await utils.cast_texted_vote(2, phoneNumber);
                let test_value = casted !== null;
                expect(test_value).to.be.true;
                resolve(test_value);

            } catch (e) {
                err_log(e);
                assert.fail('Did not submit vote -> ' + e);
                reject(e);
            }

            try {
                // cast vote
                let casted = await utils.castVote(ev_id, opt_index, result_uid);
                let test_value = casted === null;
                expect(test_value).to.be.true;
                resolve(test_value);

            } catch (e) {
                ok_log('Did not over-vote -> ' + e);
                resolve('Did not over-vote');
            }

        })
    });

    it('grabs plan stats?', async function() { return new Promise(async function (resolve, reject) {

       try {
           console.log('yo')
          let stats = await utils.get_plan_stats();
          let test_value = stats !== null;
          expect(test_value).to.be.true;
          resolve('Got plans')
          return 'ok';
       } catch (e) {
           err_log(e);
           assert.fail(e);
           reject('Did not get plans')
           return 'oh';
       }
    })})

    it('updates the plan', async function() { return new Promise(async function (resolve, reject) {

       try {
          let new_plan = 'PZ,41';
          let plan = await utils.update_plan(null, new_plan, {uid: result_uid});
          ok_log('updated plan to ' + plan);
          let test_value = plan !== null;
          expect(test_value).to.be.true;
          // resolve('Updated plans')
          // return 'ok';
       } catch (e) {
           err_log(e);
           assert.fail(e);
           reject('Did not update plan')
           return 'oh';
       }
       try {
          let new_plan = 'PZ,1';
          let plan = await utils.update_plan(null, new_plan, {uid: result_uid});
          err_log('should have blocked plan')
          let test_value = plan !== null;
          assert.fail('should have blocked bad plan input')
          reject('Updated plans')
          return 'oh';
       } catch (e) {
           ok_log(e);
           assert.isOk('Blocked bad custom value');
           resolve('Blocked bad custom value')
           return 'ok';
       }
    })})

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

        this.timeout(0);                                                                                                                                  log('\n');                                                                                                                                 log('\n');
        let sample_amount_donated = 20; // USD
        var custid;

        it('gets the customer\'s stripe id', async function() {
               try {
                  custid = await utils.getStripeCustomerId(result_uid);
                  ok_log('set custid to ' + custid)
                  let test_value = custid != null;
                  expect(test_value).to.be.true;
                  return 'ok';
               } catch (e) {
                   assert.fail(e);
                   return 'oh';
               }
           });

          it('gets the user\'s charged info', async function() {
              try {
                  ok_log('custid = ' + custid)
                  let resp = await utils.customer_charged_successfully(custid, sample_amount_donated);
                      // console.log(prettify(resp));
                  let test_value = resp != null;
                  expect(test_value).to.be.true;
                  return 'ok';
              } catch (e) {
                  assert.fail(e);
                  return 'oh';
              }
          });



          this.timeout(0);                                                                                                                                  log('\n');                                                                                                                                 log('\n');


        it('deletes the test user\'s data', async function() {
            return new Promise(async function (resolve, reject) {
                if (result_uid == null) { resolve('Could not delete -> no user info to delete'); return; }

                try {
                    let ex = await utils.userExists(result_uid);
                    console.log('User exists: ' + (ex !== null));
                } catch (e) {
                    err_log(e);
                }


                try {
                    // delete user
                    let x = await utils.deleteUser(result_uid);
                    ok_log('delete user complete.');
                } catch (e) {
                    err_log(e);
                    assert.fail('Could not find a user to delete! -> ' + e);
                    reject(e);
                }

                try {
                    let ex = await utils.userExists(result_uid);
                    if (ex === null) ok_log('User auth has been successfully deleted');
                    else {  err_log('User info still exists'); reject('Err'); }
                } catch (e) {
                    err_log('User info still exists'); reject('Err');
                }

                try {
                    let ex = await utils.getUserInfo(result_uid);
                    if (ex === null) ok_log('User info has been successfully deleted');
                    else {  err_log('User info still exists'); reject('Err'); }
                } catch (e) {
                    err_log('User info still exists'); reject('Err');
                }
                resolve('success');
                assert.isOk('everything', 'evverything is ok');

            });
        });


});


describe('Utility Function tester', async function() {                                                                                                                                      log('\n');
  this.timeout(0);

      it('tests the error in getWinningOptionForEvent', function() {
        return new Promise(async function (resolve, reject) {
          try {
            let eid = 0;
              let plan_stats = await utils.getWinningOptionForEvent(eid);
              assert.fail('should have failed');
                reject(plan_stats);
          } catch (e) {
            ok_log(e);
            assert.isOk('Get Winning Option For Event doesnt break upon ' + e);
            resolve('');
          }
        })
      });

});

describe('SMS Test Suite', () => {
    let group = ['9086421391', '9086421391'];
    it('sends a group text', async function() {
        sms.groupText(group, 'Casual Hello from GiveAssist.');
        assert.isOk('sent group text');
    })
});

describe('Plans.js Test Suite', () => {
    it('sends a group text', async function() {
        let amt1 = 449.99;
        expect(plansjs.formatPlan('PX',amt1)).to.equal('PX,4.99')
        expect(plansjs.formatPlan('PZ',amt1)).to.equal('PZ,449.99')
        expect(plansjs.formatPlan('PZ',-2.32)).to.equal('PZ,-2.32')
        expect(plansjs.planExists('PZ')).to.be.true;
        expect(plansjs.planExists('PW')).to.be.false;
        expect(plansjs.titleOfPlanWithCost(4.99)).to.equal('PX')
        expect(plansjs.titleOfPlanWithCost(4.49)).to.equal('PZ')
        expect(plansjs.priceForPlanWithTitle('PY')).to.equal(2.99)
        expect(plansjs.priceForPlanWithTitle('PX')).to.equal(4.99)
        expect(plansjs.priceForPlanWithTitle('PZ')).to.be.null
        expect(plansjs.lowestPlanCost()).to.equal(2.99)
    })
});

describe('Create New Event Test Suite',  function() {
    this.timeout(0);                                                                                                                                  log('\n');                                                                                                                                 log('\n');
    let new_event_req_body = testdata.unformalized_new_test_event();
       it('creates a new event', async function() {
           try {
               let res = await createvent.create_new_event(new_event_req_body, false); // ISSUE. Remove line & it posts the data (but never terminates test)
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
              let res = await createvent.create_new_event(new_event_req_body, true); // ISSUE. Remove line & it posts the data (but never terminates test)
              assert.isOk('Ok','Ok');
              return 'ok';
          } catch (e) {
              assert.fail(e);
              reject('oh');
              return 'oh';
          }
      });
});

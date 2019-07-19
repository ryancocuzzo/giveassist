
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
var stripe = require("stripe")("[REDACTED]"); // livelet chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// Get a reference to the root of the Database
var root = utils.root;

function log(output) {
  console.log(output)
}
function logn(output) {
  console.log('\n' + output)
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


/*

SIGN UP FLOW:

2. Post User Info
3. Create payment token
4. Create Stripe User
5. Init payments

*/ 

describe('Sign Up Flow Test Suite', async function() {                                                                                                                                      log('\n');

  this.timeout(0);

  it('creates a fb user', async function() {
      return new Promise(async function (resolve, reject) {
        try {
          // create user
          user_record = await admin.auth().createUser({
            email: email,
            emailVerified: false,
            phoneNumber: phoneNumber,
            password: password,
            displayName: displayName
          })
          let test_value = user_record != null && user_record.uid != null;
          expect(test_value).to.be.true; 
          resolve(user_record);
        } catch (e) {
          assert.fail('Did not create user');
          reject(e);
      }
    })
  });

  // /*   2    */ 

  // var posted_info;
  
  //   it('posts user info', async function() {
  //     return new Promise(async function (resolve, reject) {
  //       try {
  //         let uid = user_record.uid;
  //         // post user info
  //         posted_info = await utils.postUserInfo(name,email,plan,displayName,phoneNumber,uid);
  //         let fetched_user_info = await utils.getUserInfo(uid);
  //         let test_value = fetched_user_info != null && fetched_user_info['n'] != null && fetched_user_info['e'] != null && fetched_user_info['p'] != null && fetched_user_info['dn'] != null && fetched_user_info['z'] != null && fetched_user_info['j'] != null;
  //         expect(test_value).to.be.true; 
  //         resolve(fetched_user_info);
  //       } catch (e) {
  //         assert.fail('ISSUE: ' + e);
  //         reject(e);
  //       }
  //     });
  //   });



    /*   3    */ 

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
              // .then(async function(tkn) {
              //   log('gotit: ' + tkn)
              //   card_token = await stripe.customers.createSource(created_user,{token: tkn});
                let test_value = card_token != null;
                expect(test_value).to.be.true; 
                resolve(card_token);
              // });
          } catch (e) {
            assert.fail('ISSUE: ' + e);
            reject(e);
          }
        })
      });
      
        /*   4    */ 

        var created_user;

      
        it('creates the stripe user', async function() {
          return new Promise(async function (resolve, reject) {
            try {
              let uid = user_record.uid;
              // create stripe user
              created_user = await utils.createStripeUser(card_token.id, email, uid);
              let test_value = created_user != null;
              expect(test_value).to.be.true; 
              resolve(created_user);
            } catch (e) {
              assert.fail('ISSUE: ' + e);
              reject(e);
            }
          });
        });
    

    /*   5    */ 

    var init_payments_done;

      it('should have initialized payments (generated the user\'s subscription)', async function() {
        return new Promise(async function (resolve, reject) {
          try {
            let uid = user_record.uid;
            // init payments
            init_payments_done = await utils.executeCreateSubscription(uid, plan);
            let test_value = init_payments_done != null;
            expect(test_value).to.be.true; 
            resolve(init_payments_done);
          } catch (e) {
            assert.fail('ISSUE: ' + e);
            reject(e);
          }
        });
      });


  it('deletes the test user\'s data', async function() {
    this.timeout(0);
    return new Promise(async function (resolve, reject) {

      try {

        let uid = user_record.uid;

        // delete user
        await utils.deleteUser(uid);
        // log('Delete executed.');
        
      } catch (e) {
        // log('Could not find a user to delete!');
        assert.fail('Could not find a user to delete! -> ' + e);
        reject(e);
      }

      try {

        let uid = user_record.uid;

        // verify user's deleted - auth
        let user_exists = await utils.userExists(uid);
        if (user_exists == null)
          assert.ok('User auth has been successfully deleted');
        else
          assert.fail('ISSUE: User auth Still exists.');
      } catch (e) {
        assert.fail('ISSUE: User auth Still exists. -> ' + e);
      }

      try {

        let uid = user_record.uid;


        // verify user's deleted - db
        let user_info_fetched = await utils.getUserInfo(uid);
        if (user_info_fetched == null) {
           assert.ok('User info has been successfully deleted');
           resolve('User info has been successfully deleted');
        }
        else {
          assert.fail('ISSUE: User info Still exists.');
          reject('ISSUE: User info Still exists.');
        }
      } catch (e) {
        assert.fail('ISSUE: User info Still exists.');
        reject('ISSUE: User info Still exists. -> ' + e);
      }
      });
  });
  

});



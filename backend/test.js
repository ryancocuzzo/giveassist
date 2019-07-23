
// var assert = require('assert');
var admin = require("firebase-admin");
var utils = require('./util.js');
var stripe = utils.stripe;
let chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var clc = require("cli-color");


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

describe('New Sign Up Flow Test Suite', async function() {                                                                                                                                      log('\n');

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



import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import firebase, { auth, provider } from './firebase.js';
import variables from './variables.js';
let server_urls = variables.server_urls;


// trim the 'remium ' out of each option (for space)
export var trimSelectedOption = (opt) =>  {
  if (opt == null) return null;
  return opt.replaceAll('remium ', '');
}

// trim the 'remium ' out of each option (for space)
export var untrimSelectedOption = (opt) =>  {
  if (opt == null) return null;
  return (opt.replaceAll('P', 'Premium ')).split(',')[0];
}

var validateEmail = (email) => {
   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
}

var validatePhone = (phone) => {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone));
}

var extractPhoneNumber = (uncleaned) => {
  var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
  return cleaned;
}

/* leave breadcrumb */
function nbc(prev_breadcrumb) {

  console.log('.. breadcrumb ' + (prev_breadcrumb + 1));
  return prev_breadcrumb + 1;
}
export const _signUpUser = async (paymentToken, name, email, password, phone, displayName,  selected_option, amountPaid) => {
  console.log('Beginning sign up process..');
  // init breadcrumbs
  var bc = nbc(-1);
  return new Promise(async function(resolve, reject) {
    try {

      let selected_option_with_amt = trimSelectedOption(selected_option);

      selected_option_with_amt += ',';
      selected_option_with_amt += amountPaid;

      // All fields cleared
      var userJson = {
        n: name,                             // name
        e: email,                            // email
        p: selected_option_with_amt,                             // plan
        dn: displayName,                     // display name
        j: moment().format('LL'),                       // timestamp
        z: extractPhoneNumber(phone)    // phone number
      };

      var userQueriableJSON = {
        dn: displayName,
        p: selected_option_with_amt
      };

      bc = nbc(bc);
      let createdUser = await firebase.auth().createUserWithEmailAndPassword(email, password);
      var user = await firebase.auth().signInWithEmailAndPassword(email, password);

      var idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);

      // handle
      user = user.user;

      bc = nbc(bc);


      let postUserInfo = await axios.post(server_urls.postUserInfo, {params: {
        idToken: idToken,
        n: userJson.n,
        e: userJson.e,
        p: userJson.p,
        dn: userJson.dn,
        z: userJson.z,
      }});

      

      bc = nbc(bc);

      let uid = user.uid;

      console.log('We now have USER:\n'  + uid);

      // bc = nbc(bc);
      //
      // let stripe_user = await axios.get(server_urls.createStripeUser, {params: { uid: user.uid }});



      // alert('got id token: ' + idToken.substring(0,10) + '.. and pay token: ' + paymentToken.substring(0,10) + '.. and untrimmed plan: ' + selected_option_with_amt  );

      let customer_id = await axios.get(server_urls.createStripeUser, {params: {
        idToken: idToken,
        paymentToken: paymentToken,
        plan: selected_option_with_amt,
      }});


      // alert('created stripe user..: ' + idToken);

      bc = nbc(bc);

      let subscription = await axios.get(server_urls.initPayments, {params: {
        idToken: idToken,
        plan: selected_option_with_amt
      }});

      bc = nbc(bc);

      let resolve_json = {
        user: user,
        subscription: subscription
      }

      // alert('Resolving!!');
      resolve(resolve_json);

    } catch (e) {
      // alert('Rejecting!!');
      // reject(e);
      // return e;
      console.log('\nError in sign up flow: ' + e);
      try {
        if (firebase.auth().currentUser != null) {
          var idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
          console.log('got id token: ' + idToken);

          let delete_user_response = await axios.get(server_urls.deleteUser, {params: {
            idToken: idToken,
          }});
          reject(e);
        } else {
          reject(e);
        }
      } catch (e2) {
        console.log('\nError in sign up user deletion flow: ' + e2);
        // still reject e though
        reject(e);
      }
    }
  });

}

// let User = {
//     async signUp(paymentToken, name, email, password, phone, displayName,  selected_option, amountPaid) {
//       return new Promise(async function(resolve, reject) {
//         _signUpUser(paymentToken, name, email, password, phone, displayName,  selected_option, amountPaid).then(function(resp) {
//           console.log('returned result!');
//           resolve(resp);
//         }).catch(function(err) {
//           console.log('returned error!');
//           reject(err);
//         })
//       })
//     },
//     untrimSelectedOption: function (opt) { return untrimSelectedOption(opt); }
// }

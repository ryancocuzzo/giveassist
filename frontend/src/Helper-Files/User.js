import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import firebase, { auth, provider } from '../Helper-Files/firebase.js';
import variables from '../Helper-Files/variables.js';
let server_urls = variables.server_urls;

function  ok_log(x) { console.log('%cOK%c ' + x, 'background-color: lightGreen; color: green; padding: 5px 3px;  border-radius: 3px; ', '');  }
function  err_log(x) { console.log('%cError%c ' + x, 'background-color: red; color: white; padding: 5px 3px; border-radius: 3px; ', '');  }


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

export const _signUpUser = async (paymentToken, name, email, password, phone, displayName,  selected_option, amountPaid) => {
  return new Promise( async function(resolve, reject) {
    try {

      let selected_option_with_amt = trimSelectedOption(selected_option) + ',' + amountPaid;

      // All fields cleared
      var userJson = {
        n: name,                             // name
        e: email,                            // email
        p: selected_option_with_amt,         // plan
        dn: displayName,                     // display name
        j: moment().format('LL'),            // timestamp
        z: extractPhoneNumber(phone)         // phone number
      };

      let initiated_user = await axios.post(server_urls.initiate_new_user, {params: {
        n: userJson.n,
        e: userJson.e,
        p: userJson.p,
        dn: userJson.dn,
        z: userJson.z,
        pw: password,
        paymentToken: paymentToken
      }});

        let token = await firebase.auth().signInWithEmailAndPassword(email, password);

        let res = {
            'user_info': userJson,
            'token': token
        };

        resolve(res);

    } catch (e) { err_log(e); reject(e); }

});


}

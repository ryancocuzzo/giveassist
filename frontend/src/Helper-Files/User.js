import axios from 'axios';
import moment from 'moment';
import firebase from './firebase.js';
import variables from './variables.js';

const server_urls = variables.server_urls;

/** Trim 'remium ' out of plan option (for display space) */
export const trimSelectedOption = (opt) => {
  if (opt == null) return null;
  return opt.replaceAll('remium ', '');
};

/** Expand plan option for display */
export const untrimSelectedOption = (opt) => {
  if (opt == null) return null;
  return (opt.replaceAll('P', 'Premium ')).split(',')[0];
};

const extractPhoneNumber = (uncleaned) => {
  return String(uncleaned).replace(/[()+ -]/g, '');
};

export const _signUpUser = async (paymentToken, name, email, password, phone, displayName, selected_option, amountPaid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const selected_option_with_amt = trimSelectedOption(selected_option) + ',' + amountPaid;

      const userJson = {
        n: name,
        e: email,
        p: selected_option_with_amt,
        dn: displayName,
        j: moment().format('LL'),
        z: extractPhoneNumber(phone)
      };

      await axios.post(server_urls.initiate_new_user, {
        params: {
          n: userJson.n,
          e: userJson.e,
          p: userJson.p,
          dn: userJson.dn,
          z: userJson.z,
          pw: password,
          paymentToken: paymentToken
        }
      });

      const token = await firebase.auth().signInWithEmailAndPassword(email, password);

      resolve({ user_info: userJson, token });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};

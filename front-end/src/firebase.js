// src/firebase.js
import firebase from 'firebase';
// Your web app's Firebase configuration
  var config_dev_sandbox = {
    apiKey: "AIzaSyAUECj3-IzVLcedarFxfFq0vUWzG5yUcWY",
    authDomain: "giveassist-inc-dev-sandbox.firebaseapp.com",
    databaseURL: "https://giveassist-inc-dev-sandbox.firebaseio.com",
    projectId: "giveassist-inc-dev-sandbox",
    storageBucket: "giveassist-inc-dev-sandbox.appspot.com",
    messagingSenderId: "1054713641478",
    appId: "1:1054713641478:web:bad802e43601947c"
  };
var config_production = {
    apiKey: "AIzaSyAL1jTucV0oqG4kpFCOkudEmN_7_-CvDYg",
    authDomain: "donate-rcocuzzo-17387568.firebaseapp.com",
    databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
    projectId: "donate-rcocuzzo-17387568",
    storageBucket: "donate-rcocuzzo-17387568.appspot.com",
    messagingSenderId: "352064246619"
  };

  firebase.initializeApp(config_dev_sandbox);
  
  export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;

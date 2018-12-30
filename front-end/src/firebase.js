// src/firebase.js
import firebase from 'firebase';
var config = {
    apiKey: "AIzaSyAL1jTucV0oqG4kpFCOkudEmN_7_-CvDYg",
    authDomain: "donate-rcocuzzo-17387568.firebaseapp.com",
    databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
    projectId: "donate-rcocuzzo-17387568",
    storageBucket: "donate-rcocuzzo-17387568.appspot.com",
    messagingSenderId: "352064246619"
  };
  firebase.initializeApp(config);
  export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;

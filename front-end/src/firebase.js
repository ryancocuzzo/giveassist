// src/firebase.js
import firebase from 'firebase';
import vars from './variables.js';
let config = vars.fb_config;
  firebase.initializeApp(config);

  export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;

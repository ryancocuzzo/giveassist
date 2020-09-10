var admin = require("firebase-admin");
var prod_serviceAccountKey = require("./prod_serviceAccountKey");
var dev_serviceAccountKey = require("./dev_serviceAccountKey");

var production_app = {
    credential: admin.credential.cert(prod_serviceAccountKey),
    databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
    storageBucket: "donate-rcocuzzo-17387568.appspot.com"
}

var dev_sandbox_app = {
    credential: admin.credential.cert(dev_serviceAccountKey),
    databaseURL: "https://giveassist-inc-dev-sandbox.firebaseio.com"
};

const tw_accountSid = '[REDACTED]';
const tw_authToken = '[REDACTED]';
const twilio_client = require('twilio')(tw_accountSid, tw_authToken);
const twilio_phoneNumber = '+19083049973';
const STRIPE_ACCT_ID = '[REDACTED]';

// xxxxxxxxxxxxxxxxxxxxxxxx
                        // x
let TEST_MODE = false;   // x
                        // x
// xxxxxxxxxxxxxxxxxxxxxxxx

var stripe;

if (TEST_MODE == true) {
    stripe = require("stripe")("[REDACTED]");
    admin.initializeApp(dev_sandbox_app);
} else {
    stripe = require("stripe")("[REDACTED]");
    admin.initializeApp(production_app);
}

var root = admin.database();

module.exports = {
    TEST_MODE: TEST_MODE,
    root: root,
    stripe: stripe,
    admin: admin,
    twilio_client: twilio_client,
    STRIPE_ACCT_ID: STRIPE_ACCT_ID,
    twilio_phoneNumber: twilio_phoneNumber
}









// /*
//   TEST: [REDACTED]
//   LIVE: [REDACTED]
// */
// // var stripe = require("stripe")("[REDACTED]"); // test
// var stripe = require("stripe")("[REDACTED]"); // live
// Get a reference to the root of the Database

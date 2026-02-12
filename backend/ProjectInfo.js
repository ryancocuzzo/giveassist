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

// xxxxxxxxxxxxxxxxxxxxxxxx
                        // x
let TEST_MODE = false;   // x
                        // x
// xxxxxxxxxxxxxxxxxxxxxxxx

const requiredEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'STRIPE_ACCOUNT_ID',
    'STRIPE_SECRET_KEY_TEST',
    'STRIPE_SECRET_KEY_LIVE'
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missing.join(', ')}. ` +
        'See .env.example for setup.'
    );
}

const tw_accountSid = process.env.TWILIO_ACCOUNT_SID;
const tw_authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio_phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const STRIPE_ACCT_ID = process.env.STRIPE_ACCOUNT_ID;

const twilio_client = require('twilio')(tw_accountSid, tw_authToken);

const stripeSecretKey = TEST_MODE
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY_LIVE;

var stripe = require("stripe")(stripeSecretKey);

if (TEST_MODE) {
    admin.initializeApp(dev_sandbox_app);
} else {
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

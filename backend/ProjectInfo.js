const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const DEMO_MODE = process.env.DEMO_MODE === 'true';

if (DEMO_MODE) {
  console.log('\n=== RUNNING IN DEMO MODE ===\n');

  const mockServices = require('./demo/mockServices');
  module.exports = {
    DEMO_MODE: true,
    TEST_MODE: false,
    root: mockServices.root,
    stripe: mockServices.stripe,
    admin: mockServices.admin,
    twilio_client: mockServices.twilio_client,
    STRIPE_ACCT_ID: 'acct_demo_000',
    twilio_phoneNumber: '+10000000000'
  };

} else {
  const admin = require('firebase-admin');
  const prod_serviceAccountKey = require('./prod_serviceAccountKey');
  const dev_serviceAccountKey = require('./dev_serviceAccountKey');

  const production_app = {
    credential: admin.credential.cert(prod_serviceAccountKey),
    databaseURL: 'https://donate-rcocuzzo-17387568.firebaseio.com',
    storageBucket: 'donate-rcocuzzo-17387568.appspot.com'
  };

  const dev_sandbox_app = {
    credential: admin.credential.cert(dev_serviceAccountKey),
    databaseURL: 'https://giveassist-inc-dev-sandbox.firebaseio.com'
  };

  const TEST_MODE = false;

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

  const stripe = require('stripe')(stripeSecretKey);

  if (TEST_MODE) {
    admin.initializeApp(dev_sandbox_app);
  } else {
    admin.initializeApp(production_app);
  }

  const root = admin.database();

  module.exports = {
    DEMO_MODE: false,
    TEST_MODE,
    root,
    stripe,
    admin,
    twilio_client,
    STRIPE_ACCT_ID,
    twilio_phoneNumber
  };
}

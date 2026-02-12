const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utils = require('./util.js');
const plansjs = require('./plans.js');
const DBLinks = require('./DBLinks.js');
const logging = require('./logging.js');
const helpers = require('./helpers.js');
const CreateEvent = require('./CreateEvent.js');
const sms = require('./SMS.js');
const projinfo = require('./ProjectInfo.js');

const admin = projinfo.admin;
const stripe = projinfo.stripe;
const { MessagingResponse } = require('twilio').twiml;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PLANS = plansjs.PLANS;
const DB = DBLinks.DB;
const { log, err_log, ok_log, table_log, log_group_begin: group_begin, log_group_end: group_end } = logging;

process.env.NODE_ENV = 'production';

const port = process.env.PORT || 1234;

const ADMIN_KEY = process.env.ADMIN_KEY || 'demo_admin_key';

const check_string = (s) => {
  return s && typeof s === 'string' && s.length > 0 && s.length < 50;
};

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.send(projinfo.DEMO_MODE ? 'Running in DEMO mode..' : 'Running..');
});

// ─── SMS Voting ──────────────────────────────────────────────────────────────

app.post('/sms', async (req, res) => {
  const user_vote = req.body.Body;
  const msg_from = req.body.From;

  log('Got user reply info..');

  sms.cast_texted_vote(user_vote, msg_from).then(() => {
    const twiml = new MessagingResponse();
    twiml.message('Vote submitted!');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }).catch((issue) => {
    log('Caught SMS Error: ' + issue);
    const twiml = new MessagingResponse();
    twiml.message('Sorry, we couldn\'t process your vote! Please double-check that the option you\'ve selected is valid!');
    res.writeHead(500, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  });
});

app.post('/smserror', (req, res) => {
  log('TWILIO ERROR: ' + JSON.stringify(req.body.ErrorCode));
  const twiml = new MessagingResponse();
  twiml.message('Sorry, we couldn\'t process your vote!');
  res.writeHead(500, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// ─── User Privileges ─────────────────────────────────────────────────────────

app.get('/eventPrivileges', (req, res) => {
  const idToken = req.query.idToken;
  if (idToken == null) { res.send(false); return; }

  utils.get_decoded_token(idToken).then((decodedToken) => {
    const uid = decodedToken.uid;
    utils.canPostEvents(uid).then((canPost) => {
      res.send(canPost != null ? canPost : false);
    }).catch(() => { res.send(false); });
  }).catch(() => { res.send(false); });
});

// ─── User Registration ──────────────────────────────────────────────────────

app.post('/initiate_new_user', async (req, res) => {
  const send_status = (e) => res.status(571).send({ message: e });

  if (req.body == null || req.body.params == null) { send_status('Error: invalid params.'); return; }

  const params = req.body.params;
  const password = params.pw;
  const paymentToken = params.paymentToken;

  if (!(check_string(params.n) && check_string(params.e) && check_string(params.p)
    && check_string(params.z) && check_string(params.pw) && paymentToken)) {
    send_status('Error: invalid params.');
    return;
  }

  const usr = {
    n: params.n,
    e: params.e,
    p: params.p,
    dn: helpers.randstring(7),
    j: helpers.getToday(),
    z: params.z
  };

  console.log('Attempting to init user with Name: ' + usr.n + ', Email: ' + usr.e + ', Plan: ' + usr.p);

  try {
    const result = await utils.initiate_new_user(usr.e, password, usr, paymentToken);
    res.send(result);
  } catch (e) {
    err_log('RESOLVE-> ' + e);
    if (e !== 'USER_EXISTS') {
      admin.auth().getUserByEmail(params.e)
        .then((userRecord) => {
          utils.deleteUser(userRecord.uid).then(() => send_status(e)).catch(() => send_status(e));
        })
        .catch(() => { send_status(e); });
    }
  }
});

// ─── Event Stats ─────────────────────────────────────────────────────────────

app.get('/totalUsersForEvent', async (req, res) => {
  if (req == null || req.query == null) { res.send(new Error('invalid request')); return; }
  utils.getTotalUsersForEvent(req.query.eventId)
    .then((total) => res.send(total))
    .catch((e) => res.send(e));
});

app.get('/get_plan_stats', async (req, res) => {
  if (req == null || req.query == null) { res.send(new Error('invalid request')); return; }
  utils.get_plan_stats()
    .then((obj) => res.send(obj))
    .catch((e) => res.send(e));
});

// ─── Stripe Webhook ──────────────────────────────────────────────────────────

app.post('/event_log', async (req, res) => {
  if (req == null || req.body == null) { res.send('Sorry, bad input!'); return; }

  const event_json = req.body;

  if (event_json.type === 'charge.succeeded') {
    try {
      ok_log('charge succeeded');
      const object = event_json.data.object;
      const cust_id = object.customer;
      let amountContributed = Number(object.amount) / 100;

      ok_log('found customer id and the amount they contributed!');
      table_log([new helpers.Customer(cust_id, amountContributed)]);

      const successful_charge = await utils.customer_charged_successfully(cust_id, amountContributed);
      res.send(successful_charge);
    } catch (e) {
      err_log(e);
      res.send(e);
    }
  } else if (event_json.type === 'payout.created') {
    utils.performMonthlyRollover()
      .then((out) => { res.send(out); })
      .catch((e) => { res.status(571).send(e); });
  } else if (event_json.type === 'charge.failed') {
    err_log('charge failed');
    const object = event_json.data.object;
    const cust_id = object.customer;
    try {
      const uid = await utils.getFirebaseUserFromCustomerId(cust_id);
      DB.User_prevChargeStatus(uid).set('FAILED');
      res.send('ok - failed.');
    } catch (e) {
      err_log('Could not find customer');
      res.send('Could not find customer');
    }
  } else {
    res.send('ok');
  }
});

// ─── Payment Management ─────────────────────────────────────────────────────

app.post('/changePaymentSource', async (req, res) => {
  console.log('Changing stripe user source payment...');
  if (!req.body) { err_log('Invalid inputs.'); res.status(571).send('Invalid params.'); return; }

  const idToken = req.body.tokenId;
  const paymentToken = req.body.paymentToken;

  if (!idToken || !paymentToken) { err_log('Invalid inputs.'); res.status(571).send('Invalid params.'); return; }
  ok_log('Valid inputs.');

  try {
    const decodedToken = await utils.get_decoded_token(idToken);
    ok_log('Decoded auth token.');

    const uid = decodedToken.uid;
    const cust_id = await utils.getStripeCustomerId(uid);
    ok_log('Got stripe customer id.');

    const x = await stripe.customers.createSource(cust_id, { source: paymentToken });
    ok_log('created source with pay token.');

    stripe.customers.update(cust_id, { default_source: x.id }, (err, resp) => {
      if (resp) {
        ok_log('Successfully updated pay source');
        res.send(resp);
      } else {
        err_log(err);
        res.send(err);
      }
    });
  } catch (e) {
    err_log(e);
    res.send('Server error: ' + e);
  }
});

// ─── Plan Management ─────────────────────────────────────────────────────────

app.post('/change_plan', async (req, res) => {
  group_begin('Plan Change');

  if (!req.body) { res.status(571).send('Invalid params.'); group_end(); return; }

  const idToken = req.body.idToken;
  const planNameAndAmt = req.body.plan;

  if (!idToken || !planNameAndAmt) { res.status(571).send('Invalid params.'); group_end(); return; }

  try {
    const subid = await utils.update_plan(idToken, planNameAndAmt);
    ok_log('Successfully performed plan update.');
    res.send(subid);
    group_end();
  } catch (e) {
    err_log(e);
    res.status(571).send('Server error: ' + e);
    group_end();
  }
});

// ─── Account Deletion ────────────────────────────────────────────────────────

app.post('/deleteUser', async (req, res) => {
  const idToken = req.body.idToken;

  group_begin('POST Delete User..');
  try {
    const decodedToken = await utils.get_decoded_token(idToken);
    if (!decodedToken) throw new Error('Invalid token provided.');
    ok_log('DELETE authenticated..');

    const uid = decodedToken.uid;
    await utils.deleteUser(uid);
    ok_log('Successfully deleted user');

    res.send('Done');
    group_end();
  } catch (e) {
    err_log('Could not delete user -> ' + e);
    res.send(e);
    group_end();
  }
});

// ─── Voting ──────────────────────────────────────────────────────────────────

const MAX_N_OPTIONS = 3;

app.post('/castVote', async (req, res) => {
  if (!(req && req.body && req.body.params)) { res.status(571).send({ message: 'invalid params' }); return; }

  const idToken = req.body.params.idToken;
  const voteId = req.body.params.voteId;
  const eventId = req.body.params.eventId;

  if (!check_string(eventId) || typeof voteId !== 'number' || voteId >= MAX_N_OPTIONS || !idToken) {
    res.status(571).send({ message: 'invalid params' });
    return;
  }

  try {
    const uid = (await utils.get_decoded_token(idToken)).uid;
    const castedVote = await utils.castVote(eventId, voteId, uid);
    res.send(castedVote);
  } catch (e) {
    err_log(e);
    res.status(572).send('Already voted');
  }
});

// ─── Admin: Create Event ─────────────────────────────────────────────────────

app.post('/create_event', async (req, res) => {
  if (req && req.body) {
    if (req.body.ADMIN_KEY === ADMIN_KEY && req.body.is_preexisting != null && req.body.is_preexisting !== '') {
      let pre = (req.body.is_preexisting === 'true' || req.body.is_preexisting === true);
      pre = !pre; // Naming on form is inverted

      try {
        const created = await CreateEvent.create_new_event(req.body, pre);
        res.status(200).send(created);
      } catch (e) {
        err_log(e);
        res.status(500).send('Failed to create event');
      }
    } else {
      res.status(401).send('User not authorized.');
    }
  } else {
    res.status(501).send('Bad input.');
  }
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(port, () => console.log('Server running on port ' + port + '!\n'));

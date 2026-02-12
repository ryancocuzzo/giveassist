const DBLinks = require('./DBLinks.js');
const logging = require('./logging.js');
const projinfo = require('./ProjectInfo.js');
const helpers = require('./helpers.js');

const root = projinfo.root;
const admin = projinfo.admin;
const client = projinfo.twilio_client;
const DB = DBLinks.DB;
const { log, err_log, ok_log, log_group_begin: group_begin, log_group_end: group_end } = logging;

const ADMIN_PHONE = process.env.ADMIN_PHONE || null;

const getActiveEventId = async () => await DB.Event_active().fetch();
const eventSnapshot = async (eventId) => await DB.Event_info(eventId).fetch();

/** Send a text message to a single phone number */
function send_text_message(pn, body) {
  if (pn == null) { log('Warning: Could not send text to empty number!'); return; }
  log('Sending message to ' + pn + '..');
  pn = helpers.extractPhoneNumber(pn);
  client.messages
    .create({
      body: body,
      from: projinfo.twilio_phoneNumber,
      to: '' + pn
    })
    .then((message) => console.log(message.sid))
    .catch((err) => { log('ERR: ' + err); });
}

/** Send the same text to a list of phone numbers */
function groupText(pn_list, body) {
  log('Group texting ' + body);
  pn_list.forEach((pn) => { send_text_message(pn, body); });
}

/** Notify all users that the voting window is open */
async function notifyPeople() {
  try {
    group_begin('Notify People');
    const user_phoneNumbers = await get_all_user_phoneNumbers();
    ok_log('got all user phone numbers');
    if (user_phoneNumbers == null) { log('No user phone numbers!'); return; }

    const voting_options = await getOptionsDispersion();
    ok_log('got voting options');
    if (voting_options == null) { log('No voting options!'); return; }

    let resp = 'Hi there, this is the team at GiveAssist letting you know the voting window is open! Feel free to reply with the digit of your selected option of the month! ';
    let index = 1;

    voting_options.forEach((opt) => {
      if (opt['name'] != null && opt['summary'] != null) {
        resp += '\n\n' + index + '. ';
        const option_string = opt['name'] + '\n' + (opt['summary'].length < 70 ? opt.summary : (opt.summary.substring(0, 70) + '.. [Read more on our site!]'));
        resp += option_string;
        index++;
      }
    });

    resp += '\n\nhttps://giveassist.org/';
    ok_log('set up text');
    groupText(user_phoneNumbers, resp);
    group_end();
  } catch (e) {
    log('Notify People error: ' + e);
    group_end();
  }
}

const getOptionsDispersion = async () => {
  const active_event_id = await getActiveEventId();
  const snap = await eventSnapshot(active_event_id);

  const event = {
    title: snap['t'],
    summary: snap['s'],
    options: snap['o'],
    id: snap['id']
  };

  const objArray = [];
  if (event && event.options) {
    Object.keys(event.options).forEach((key) => {
      const op_snap = event.options[key];
      objArray.push({
        name: op_snap['t'],
        summary: op_snap['s'],
        link: op_snap['link'],
        id: key
      });
    });
  }

  return objArray;
};

const get_all_user_phoneNumbers = async () => {
  return new Promise((resolve) => {
    const numbers = [];
    const ref = root.ref('/users/');
    ref.once('value', (snap) => {
      snap.forEach((child) => {
        const user = child.val();
        if (user['i'] != null) {
          const user_phone = user['i']['z'];
          if (user_phone != null) {
            numbers.push(user_phone);
          }
        }
      });
    });
    resolve(numbers);
  });
};

const spamChecker = {};
function updateSpamChecker(phone) {
  if (spamChecker[phone] == null) {
    spamChecker[phone] = 1;
  } else {
    spamChecker[phone] = Number(spamChecker[phone]) + 1;
  }

  if (spamChecker[phone] > 8 && ADMIN_PHONE) {
    send_text_message(ADMIN_PHONE, 'GIVEASSIST SERVER AUTO MSG: WE ARE GETTING SPAMMED FROM ' + phone);
  }
}

const idFromNumber = async (phone) => (await admin.auth().getUserByPhoneNumber(phone)).uid;

module.exports = {
  send_text_message,
  groupText,
  notifyPeople,
  updateSpamChecker,
  get_all_user_phoneNumbers,
  getOptionsDispersion,
  idFromNumber
};

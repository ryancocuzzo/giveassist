var DBLinks = require('./DBLinks.js');
var logging = require('./logging.js');
var projinfo = require("./ProjectInfo.js");
let root = projinfo.root;
var utils = require("./util.js");
var helpers = require('./helpers.js');
let admin = projinfo.admin;
let client = projinfo.twilio_client;
let DB = DBLinks.DB;
var log = logging.log;
var err_log = logging.err_log;
var ok_log = logging.ok_log;
var group_begin = logging.log_group_begin;
var group_end = logging.log_group_end;
var prettify = logging.prettify;


let group  =  ['9086421391'];

var getActiveEventId = async ()          => await DB.Event_active().fetch();
var eventSnapshot    = async (eventId)   => await DB.Event_info(eventId).fetch()

/* Public */
function send_text_message(pn, body) {
    if (pn == null) { log('Warning: Could not send text to empty number!'); return; }
    log('Sending message to ' + pn + '..');
    pn = helpers.extractPhoneNumber(pn);
    client.messages
    .create({
        body: body,
        from: projinfo.twilio_phoneNumber,
        to: ('' + pn)
    }).then(message => console.log(message.sid)).catch(function(err) {log('ERR: ' + err)});
}

function groupText(pn_list, body) {
    log('Group texting ' + body );
    pn_list.forEach(function(pn) {  send_text_message(pn, body); } );
}

/* Private */
async function notifyPeople() {
    try {
        group_begin('Notify People');
        var user_phoneNumbers  = await get_all_user_phoneNumbers();
        ok_log('got all user phone numbers');
        if (user_phoneNumbers == null) { log('No user phone numbers!'); return; }
        let voting_options = await getOptionsDispersion();
        ok_log('got voting options');
        if (voting_options == null) { log('No voting options!'); return; }
        var resp = 'Hi there, this is the team at GiveAssist letting you know the voting window is open! Feel free to reply with the digit of your selected option of the month! ';
        var index = 1;
        voting_options.forEach(function(opt) {
            // let option = voting_options[index-1];
            // log('Options: ' + JSON.stringify(opt));
            if ((opt['name'] != null && opt['summary'] != null)) {
                resp += ('\n\n' + index + '. ');
                let option_string = opt['name'] + '\n' + (opt['summary'].length < 70 ? opt.summary : (opt.summary.substring(0, 70) + '.. [Read more on our site!]'));
                // log('Option string: ' + option_string);
                resp += option_string;
                index++;
            }
        })
        resp += '\n\nhttps://giveassist.org/'
        ok_log('set up text');

        groupText(user_phoneNumbers, resp);

        group_end();
        // groupText(user_phoneNumbers, 'https://giveassist.org/vote');
    } catch (e)   {
        log('Notify People change error: ' +e );
        group_end();
    }
}

var getOptionsDispersion = async () => {
    return new Promise ( async function(resolve, reject) {
        try {
            let active_event_id = await getActiveEventId();

            let snap = await eventSnapshot(active_event_id);
            let event = {
                title: snap["t"],
                summary: snap["s"],
                options: snap["o"],
                id: snap['id']
            };
            var objArray = [];
            if (event) {

                Object.keys(event.options).forEach(function(key) {
                    let op_snap = event.options[key];

                    // this is the stuff we're using
                    var opt = {
                        name: op_snap['t'],
                        summary: op_snap['s'],
                        link: op_snap['link'],
                        id: key,
                    };
                    objArray.push(opt);
                });
            }

            resolve(objArray);

        } catch (e) {
            reject(e);
        }
    })
}

var get_all_user_phoneNumbers = async () => {
    return new Promise( function(resolve, reject) {
        var numbers = [];
        let ref = root.ref('/users/');
        ref.once('value', function(snap) {
            snap.forEach((child) => {
                // console.log(child.key, child.val());
                var user = child.val();
                var user_id = child.key;
                if (user['i'] != null) {
                    var user_phone  = user['i']['z'];
                    if (user_phone != null) {
                        numbers.push(user_phone);
                    }
                }
            });
        })
        resolve(numbers);
    })
}

var spamChecker = {};
function updateSpamChecker(phone) {
    if (spamChecker[phone] == null) {
        spamChecker[phone] = 1;
    } else {
        spamChecker[phone] = Number(spamChecker[phone]) + 1;
    }

    if (spamChecker[phone] > 8) {
        send_text_message('9086421391', 'GIVEASSIST SERVER AUTO MSG: WE ARE GETTING SPAMMED FROM ' + phone);
    }

}

var idFromNumber = async (phone) => (await admin.auth().getUserByPhoneNumber(phone)).uid;


/* Export */

module.exports = {
    send_text_message: send_text_message,
    groupText: groupText,
    notifyPeople: notifyPeople,
    updateSpamChecker: updateSpamChecker,
    get_all_user_phoneNumbers: get_all_user_phoneNumbers,
    getOptionsDispersion: getOptionsDispersion,
    idFromNumber: idFromNumber
}

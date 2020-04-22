var projinfo = require("./ProjectInfo.js");
var logging = require('./logging.js');
var DBLinks = require('./DBLinks.js');
var helpers = require('./helpers.js');
let root = projinfo.root;
let DB = DBLinks.DB;
var log = logging.log;
var err_log = logging.err_log;
var ok_log = logging.ok_log;
var table_log = logging.table_log;
var group_begin = logging.log_group_begin;
var group_end = logging.log_group_end;
var prettify = logging.prettify;

var getUserInfo                 = async (uid)           => await DB.User_info(uid).fetch();


/* Aggregate info
    Format:
    {
        total: total # of users
        revenue: total revenue
    }
 */
var user_info = async () => {
    return new Promise( async function(resolve, reject) {
      let ref = root.ref('/users/');
      // get all users
      ref.once('value',  function(snap) {
            var num_users = 0;
            var total_rev = 0;
            snap.forEach((child) => {
                  let val = child.val();
                  if (val && val['i']) {
                        // get their don amt as a # (base 10)
                        let amt = parseFloat(untrimSelectedOptionAmount(val['i']['p']), 10);
                        num_users++;
                        total_rev+=amt;
                  }
            });
            resolve({'total': num_users, 'revenue': total_rev});
      })
  })
}

// trim the 'remium ' out of each option (for space)
var untrimSelectedOptionAmount = (opt) =>  {
  opt = opt + '';
  let spl = opt.split(',');
  // log(spl);
  return opt.split(',')[1];
}

async function new_event_result(body) {
    // log("Recieved JSON: " + JSON.stringify(body, null, 3));
    if (body.a_link && body.a_org && body.a_title && body.a_summary && body.b_link && body.b_org && body.b_title && body.b_summary  && body.c_link && body.c_org && body.c_title && body.c_summary )
        ok_log("New event passes option requirements.");
    else {
        err_log("New event failed option requirements.");
        return null;
    }
    // log("Gen Rev: " +  body.gen_revenue_generated + " -> Null ? " + body.gen_revenue_generated != null);
    // log("Users: " +  body.gen_num_users + " -> Null ? " + body.gen_num_users != null);
    if (body.gen_summary && body.gen_title)
        ok_log("New event passes general requirements.");
    else {
        err_log("New event failed general requirements.");
        return null;
    }

    if (body.gen_revenue_generated == null || body.gen_num_users == null || body.gen_revenue_generated == "" || body.gen_num_users == "") {
          let info = await user_info();
          if (!body.gen_revenue_generated)
            body.gen_revenue_generated = info.revenue;
          if (!body.gen_num_users)
                 body.gen_num_users = info.total;
    }

    return {
        "id" : "eid" + helpers.randstring(5),
        "o" : {
          "a" : {
            "link" : body.a_link,
            "org" : body.a_org,
            "s" : body.a_summary,
            "t" : body.a_title,
            "ttl" : 0,
          },
          "b" : {
            "link" : body.b_link,
            "org" : body.b_org,
            "s" : body.b_summary,
            "t" : body.b_title,
            "ttl" : 0,
          },
          "c" : {
            "link" : body.c_link,
            "org" : body.c_org,
            "s" : body.c_summary,
            "t" : body.c_title,
            "ttl" : 0,
          },
          "ttl" : 0
        },
        "s" : body.gen_summary,
        "t" : body.gen_title,
        "ttl" : body.gen_revenue_generated,
        "tu" : body.gen_num_users
    };

}
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


var usersList = async () => {
    return new Promise( async function(resolve, reject) {
      var list = [];
      let ref = root.ref('/users/');
      ref.once('value',  function(snap) {
        snap.forEach((child) => {
          var user_id = child.key;
         list.push(user_id);
        });
              resolve(list);
      })
  })
}

var create_new_event = async (req_body, is_preexisting) => {
    return new Promise( async function(resolve, reject) {
        // make json
        let new_event_json = await new_event_result(req_body);
        if (!new_event_json) reject("Invalid Input");
        let event_id = new_event_json.id;
        ok_log("Attempting to inject new event with id " + event_id);
        // if it is old data we're inserting after-the-fact *special case*
        if (is_preexisting) {
            let list = await usersList();
            for (let user_id of list) {
                getUserInfo(user_id).then((info) => {
                    var parts = info.p.split(',', 2);
                    var current_payment_amt  = parts[1];
                    DB.User_donationForEvent(user_id, event_id).set(current_payment_amt);
                });
            }
        }
        let dbstring = '/db/events/'+event_id;
        // log('Attempting to set ' + dbstring + ' to ' + prettify(new_event_json));
        let re = root.ref(dbstring);
        if (is_preexisting) sleep(5000).then(re.set(new_event_json)).then(() => resolve(event_id));
        else re.set(new_event_json).then(() => resolve(event_id));
    });
}

module.exports = {
    create_new_event: create_new_event
}

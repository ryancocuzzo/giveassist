const projinfo = require('./ProjectInfo.js');
const logging = require('./logging.js');
const DBLinks = require('./DBLinks.js');
const helpers = require('./helpers.js');

const root = projinfo.root;
const DB = DBLinks.DB;
const { log, err_log, ok_log, prettify } = logging;

const getUserInfo = async (uid) => await DB.User_info(uid).fetch();

/**
 * Aggregate user info: total users and total revenue.
 */
const user_info = async () => {
  return new Promise(async (resolve) => {
    const ref = root.ref('/users/');
    ref.once('value', (snap) => {
      let num_users = 0;
      let total_rev = 0;
      snap.forEach((child) => {
        const val = child.val();
        if (val && val['i']) {
          const amt = parseFloat(untrimSelectedOptionAmount(val['i']['p']), 10);
          num_users++;
          total_rev += amt;
        }
      });
      resolve({ total: num_users, revenue: total_rev });
    });
  });
};

const untrimSelectedOptionAmount = (opt) => {
  const str = opt + '';
  return str.split(',')[1];
};

async function new_event_result(body) {
  if (body.a_link && body.a_org && body.a_title && body.a_summary &&
      body.b_link && body.b_org && body.b_title && body.b_summary &&
      body.c_link && body.c_org && body.c_title && body.c_summary) {
    ok_log('New event passes option requirements.');
  } else {
    err_log('New event failed option requirements.');
    return null;
  }

  if (body.gen_summary && body.gen_title) {
    ok_log('New event passes general requirements.');
  } else {
    err_log('New event failed general requirements.');
    return null;
  }

  if (!body.gen_revenue_generated || !body.gen_num_users) {
    const info = await user_info();
    if (!body.gen_revenue_generated) body.gen_revenue_generated = info.revenue;
    if (!body.gen_num_users) body.gen_num_users = info.total;
  }

  return {
    id: 'eid' + helpers.randstring(5),
    o: {
      a: { link: body.a_link, org: body.a_org, s: body.a_summary, t: body.a_title, ttl: 0 },
      b: { link: body.b_link, org: body.b_org, s: body.b_summary, t: body.b_title, ttl: 0 },
      c: { link: body.c_link, org: body.c_org, s: body.c_summary, t: body.c_title, ttl: 0 },
      ttl: 0
    },
    s: body.gen_summary,
    t: body.gen_title,
    ttl: body.gen_revenue_generated,
    tu: body.gen_num_users
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const usersList = async () => {
  return new Promise(async (resolve) => {
    const list = [];
    const ref = root.ref('/users/');
    ref.once('value', (snap) => {
      snap.forEach((child) => {
        list.push(child.key);
      });
      resolve(list);
    });
  });
};

const create_new_event = async (req_body, is_preexisting) => {
  return new Promise(async (resolve, reject) => {
    const new_event_json = await new_event_result(req_body);
    if (!new_event_json) { reject('Invalid Input'); return; }

    const event_id = new_event_json.id;
    ok_log('Attempting to inject new event with id ' + event_id);

    // If inserting historical data after-the-fact
    if (is_preexisting) {
      const list = await usersList();
      for (const user_id of list) {
        const info = await getUserInfo(user_id);
        const parts = info.p.split(',', 2);
        const current_payment_amt = parts[1];
        DB.User_donationForEvent(user_id, event_id).set(current_payment_amt);
      }
    }

    const dbstring = '/db/events/' + event_id;
    const re = root.ref(dbstring);

    if (is_preexisting) {
      await sleep(5000);
      await re.set(new_event_json);
      resolve(event_id);
    } else {
      await re.set(new_event_json);
      resolve(event_id);
    }
  });
};

module.exports = {
  create_new_event
};

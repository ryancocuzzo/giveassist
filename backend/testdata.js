var helpers = require('./helpers');

function unformalized_new_test_event() {
    let json = {
        "id" : "-LUZFB34" + helpers.randstring(10),
        "o" : {
          "a" : {
            "link" : "https://" +helpers.randstring(10) + '.com',
            "org" : "Random org",
            "s" : helpers.randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "b" : {
            "link" : "https://" +helpers.randstring(10) + '.com',
            "org" : "Random org",
            "s" : helpers.randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "c" : {
            "link" : "https://" +helpers.randstring(10) + '.com',
            "org" : "Random org",
            "s" : helpers.randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "ttl" : 0
        },
        "s" : helpers.randstring(100),
        "t" : "Test 2019",
        "ttl" : null,
        "tu" : null
    };
    let new_json = {
        "id": json.id,
        "gen_summary": json.s,
        "gen_title": json.t,
        "gen_num_users": json.tu,
        "gen_revenue_generated": json.ttl,
        "a_link": json.o.a.link,
        "b_link": json.o.b.link,
        "c_link": json.o.c.link,
        "a_org": json.o.a.org,
        "b_org": json.o.b.org,
        "c_org": json.o.c.org,
        "a_title": json.o.a.t,
        "b_title": json.o.b.t,
        "c_title": json.o.c.t,
        "a_summary": json.o.a.s,
        "b_summary": json.o.b.s,
        "c_summary": json.o.c.s,
    };
    return new_json;
}


function make_test_event() {
    return {
        "id" : "-LUZFB34" + randstring(10),
        "o" : {
          "a" : {
            "link" : "https://" +randstring(10) + '.com',
            "org" : "Random org",
            "s" : randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "b" : {
            "link" : "https://" +randstring(10) + '.com',
            "org" : "Random org",
            "s" : randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "c" : {
            "link" : "https://" +randstring(10) + '.com',
            "org" : "Random org",
            "s" : randstring(100),
            "t" : "Test test",
            "ttl" : 0,
          },
          "ttl" : 0
        },
        "s" : randstring(100),
        "t" : "Test 2019",
        "ttl" : 0,
        "tu" : 999
    }
}

module.exports = {
    unformalized_new_test_event: unformalized_new_test_event,
    
}

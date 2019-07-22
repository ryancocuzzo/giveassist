
let TEST_MODE = true;

/*

STRIPE

  TEST: pk_test_eDgW1qWOGdRdCnIQocPje0Gg
  LIVE: pk_live_GulO410dLXS1uDIODH1e8Nz5

*/

let server_root, stripe_api_key, fb_config;

if (TEST_MODE == true) {
  server_root = "http://localhost:1234";
  stripe_api_key = 'pk_test_eDgW1qWOGdRdCnIQocPje0Gg';
  // Your web app's Firebase configuration
    fb_config = {
      apiKey: "AIzaSyAUECj3-IzVLcedarFxfFq0vUWzG5yUcWY",
      authDomain: "giveassist-inc-dev-sandbox.firebaseapp.com",
      databaseURL: "https://giveassist-inc-dev-sandbox.firebaseio.com",
      projectId: "giveassist-inc-dev-sandbox",
      storageBucket: "giveassist-inc-dev-sandbox.appspot.com",
      messagingSenderId: "1054713641478",
      appId: "1:1054713641478:web:bad802e43601947c"
    };


} else {
  server_root = "https://donate-mate-app.herokuapp.com";
  stripe_api_key = 'pk_live_GulO410dLXS1uDIODH1e8Nz5';
  fb_config = {
      apiKey: "AIzaSyAL1jTucV0oqG4kpFCOkudEmN_7_-CvDYg",
      authDomain: "donate-rcocuzzo-17387568.firebaseapp.com",
      databaseURL: "https://donate-rcocuzzo-17387568.firebaseio.com",
      projectId: "donate-rcocuzzo-17387568",
      storageBucket: "donate-rcocuzzo-17387568.appspot.com",
      messagingSenderId: "352064246619"
    };
}


var variables = {
  local_urls: {
    home: '/',
    vote: "/vote",
    stats: "/stats",
    login: '/login',
    signUp: './signup',
    vaults: './vaults'
  },
  server_urls: {
    home: server_root,
    eventPriviledges: server_root + '/eventPriviledges',
    createEvent: server_root + '/createEvent',
    createStripeUser: server_root + '/createStripeUser',
    updateJoinedDate: server_root + '/updateJoinedDate',
    initPayments: server_root + '/initPayments',
    uploadProfilePicture: server_root + '/uploadProfilePicture',
    changePaymentSource: server_root + '/changePaymentSource',
    change_plan: server_root + '/change_plan',
    deleteUser: server_root + '/deleteUser',
    castVote: server_root + '/castVote',
    postUserInfo: server_root + '/postUserInfo',
    initiate_new_user: server_root + '/initiate_new_user',
    totalUsersForEvent: server_root  + '/totalUsersForEvent',
    get_plan_stats: server_root + '/get_plan_stats'
  },
  stripe_api_key: stripe_api_key,
  fb_config: fb_config
};

export default variables;

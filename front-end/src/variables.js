// import imgs from './ImgFactory.js';

var local_root = "http://localhost:8000";
// var server_root = "https://donate-mate-app.herokuapp.com";
var server_root = "http://localhost:1234";

/*

TEST: pk_test_eDgW1qWOGdRdCnIQocPje0Gg
LIVE: pk_live_GulO410dLXS1uDIODH1e8Nz5

*/
let stripe_api_key = 'pk_test_eDgW1qWOGdRdCnIQocPje0Gg';
// let stripe_api_key = 'pk_live_GulO410dLXS1uDIODH1e8Nz5';

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
    postUserInfo: server_root + '/postUserInfo'
  },
  stripe_api_key: stripe_api_key
};

export default variables;

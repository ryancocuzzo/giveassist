// import imgs from './ImgFactory.js';

var local_root = "http://localhost:8000";
var server_root = "http://localhost:1234";

var variables = {
  local_urls: {
    home: '/',
    vote: "/vote",
    stats: "/stats",
    login: '/login',
    signUp: './signup'
  },
  server_urls: {
    home: server_root,
    eventPriviledges: server_root + '/eventPriviledges',
    createEvent: server_root + '/createEvent',
    createStripeUser: server_root + '/createStripeUser',
    initPayments: server_root + '/initPayments',
    uploadProfilePicture: server_root + '/uploadProfilePicture',
    changePaymentSource: server_root + '/changePaymentSource',
    change_plan: server_root + '/change_plan',
    deleteUser: server_root + 'deleteUser'
  }
};

export default variables;

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
    createEvent: server_root + '/createEvent'
  }
};

export default variables;

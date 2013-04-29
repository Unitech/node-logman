
var Logger = require('../lib/logmanClient.js');

console.log(Logger);

Logger.init({
    port : 3044,
    ip : '127.0.0.1',
    remote : true,
    display : true
});

var logServer = Logger.getPrefixedLogger('user');

setInterval(function(){
    // Will send {username : 'toto'} with key user:new_user
    logServer('new_user', {username : 'toto'});
}, 1000);

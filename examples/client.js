
var Logger = require('../lib/logmanClient.js');

console.log(Logger);

Logger.init({
    port : 3044,
    ip : '127.0.0.1'
});

Logger.events.on('connect', function() {
    console.log('connected');
});

setInterval(function(){
    console.log('Sending error');
    Logger.error({err : 'toto'});
}, 1000);

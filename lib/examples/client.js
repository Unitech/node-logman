
var Logger = require('../logmanClient.js');

console.log(Logger);

Logger.init({
    port : 3000,
    ip : '127.0.0.1'
});

Logger.events.on('connect', function() {
    console.log('connected');
});

setInterval(function(){
    Logger.error({err : 'toto'});
}, 300);

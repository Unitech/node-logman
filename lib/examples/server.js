
var LoggyServer = require('../logmanServer.js');

var logServer = new LoggyServer({
    bind_port : 3000,
    web_port : 4444,
    enableMonitoringPage : true,
    enableClientSideLog : true
});

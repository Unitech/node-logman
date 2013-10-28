#!/usr/bin/env node

var LoggyServer = require('../lib/logmanServer.js');

var logServer = new LoggyServer({
  bind_port : 3044,
  web_port : 4444,
  enableMonitoringPage : true,
  enableClientSideLog : true
});


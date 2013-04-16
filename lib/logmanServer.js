//     __
//    / /   ____  ____ _____ ___  ____ _____
//   / /   / __ \/ __ `/ __ `__ \/ __ `/ __ \
//  / /___/ /_/ / /_/ / / / / / / /_/ / / / /
// /_____/\____/\__, /_/ /_/ /_/\__,_/_/ /_/
//             /____/                      
//

// uncomment to show debug messages
process.env.DEBUG =  'loggy:*';

var express = require('express');
var path = require('path');
var http = require('http');
var socketio = require('socket.io');
var axon = require('axon');
var Uuid = require('node-uuid');
var redis = require('redis');
var debug = require('debug')('loggy:server');
var each = require('each');

var Logman = function(options) {
    var self = this;

    debug('Initializing Logman');
    
    this.sock = axon.socket('sub-emitter');
    this.events = this.sock.bind(options.bind_port || 3044);
    this.dbClient = redis.createClient();
    // Clients list
    this.clients = {};

    // Server
    this.app = null;
    this.server = null;
    this.io = null;
    this.sockets = [];

    if (options.enableMonitoringPage)
	this.enableWebServer(options);
    if (options.enableClientSideLog)
	this.enableClientSideLog(options);


    this.start = function() {

	// Client handling
	this.events.on('connect', function(client) {
    	    var id = Uuid.v1();
    	    client._peername._id = id;
	    client._peername.date_connected = new Date();
    	    debug('New client connected from : ',
    		  client._peername.address,
    		  '- assigned id : ', id);
    	    self.clients[id] = client._peername;
	});

	this.events.on('disconnect', function(client) {
    	    var client_id = client._peername._id;
    	    
    	    debug('Client disconnected from : ',
    		  client._peername.address,
    		  '- id : ', client_id);
    	    delete self.clients[client_id];	
	});

	// Server message bus
	this.sock.on('*', function(event, data) {
	    debug('Msg received : ', event, data);
    	    self.save('server:' + event, data);
	});
	
	process.on('SIGINT', function () {
	    self.dbClient.quit();
	    process.exit(0);
	});
    };
    this.start();
};



Logman.prototype = {
    save : function(event, data) {
	// Generate key with random UUID
	//var id = 'log:' + event + ':' + Uuid.v4();
	var self = this;
	var id = 'log:' + event;
	// Bind also date
	data['date'] = new Date();
	debug('[' + event + '] ', data);	
	this.dbClient.lpush(id, JSON.stringify(data));
	if (this.io) {
	    self.broadcast(id, data);
	}
    },
    getClients : function() {
	return this.clients;
    },
    getLogsLevel : function(level, cb) {
	var self = this;

	this.dbClient.lrange('log:' + level, 0, 10, function(err, logs) {
	    if (err) return cb(err);
	    return cb(null, logs);
	});
    }
};

Logman.prototype.initWeb = function(options, cb) {
    // options => pass / username

    debug('Initiating web server');

    // var allowCrossDomain = function(req, res, next) {
    // 	    res.header('Access-Control-Allow-Origin', config.allowedDomains);
    // 	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // 	    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // 	    next();
    //} app.use(allowCrossDomain);
    
    var s = this;
    this.app = express();
    
    this.app.configure(function(){
	s.app.set('port', options.web_port || 4444);
	s.app.use(express.favicon());
	s.app.use(express.bodyParser());
	s.app.use(express.methodOverride());
    });
    
    this.app.configure('development', function(){
	s.app.use(express.errorHandler());
	s.app.use(express.logger('dev'));
    });

    this.server = http.createServer(s.app);

    this.server.listen(s.app.get('port'), function(){
	debug("Web server enabled on port " + s.app.get('port'));
	return cb();
    });

};

Logman.prototype.enableClientSideLog = function(options) {
    var self = this;
    
    if (this.app == null) {
	return self.initWeb(options, function() {
	    mountClientSideRoutes();
	});
    }
    else
	mountClientSideRoutes();

    function mountClientSideRoutes() {
	debug('Mounting client side log routes');

	// This is a JSONP method, json msg should be sent with data={msg}
	self.app.get('/client/log', function(req, res) {
	    var data = JSON.parse(req.query.data);
	    // Add client IP address
	    data['client_ip'] = req.connection.remoteAddress;
	    self.save('client:' + req.query.event, data);
	    // Send nothing
	    res.send('');	    
	});
    }
};

Logman.prototype.enableWebServer = function(options) {
    var self = this;
    
    if (this.app == null) {
	return self.initWeb(options, function() {
	    mountWebAppRoutes();
	});
    }
    else
	mountWebAppRoutes();

    function mountWebAppRoutes() {
	debug('Mounting web app routes');
	
	// Mount web app
	self.app.configure(function(){	
	    self.app.use('/', express.static(path.join(__dirname, 'app')));
	});
	
	self.app.get('/get_logs', function(req, res) {
	    self.getLogs(function(err, logs) {
		res.send(logs);
	    });
	});

	self.app.get('/get_logs/:key', function(req, res) {
	    var logs = {};
	    var key = 'log:' + req.params['key'];

	    self.dbClient.keys(key, function(err, keys) {
		debug(keys);

		each(keys)
		    .on('item', function(key, index, next) {
			logs[key] = {};
			
			self.dbClient.lrange(key, 0, 10, function(err, logsK) {
			    if (err) console.log(err);
			    logs[key] = logsK.map(JSON.parse);
			    return next();
			});
		    })
		    .on('error', function(err) {
			console.log(err.message);
		    })
		    .on('end', function() {
			console.log('Done');
			res.send(logs);
		    });		
		
	    });
	});
	
	self.app.get('/get_servers', function(req, res) {
	    res.send(self.getClients());
	});

	self.app.post('/flushlogs', function(req, res) {
	    self.dbClient.flushdb(function(err, logs) {
		return res.send({success:true});
	    });
	});

	// IO
	self.io = socketio.listen(self.server);

	self.io.configure(function() {
	    self.io.enable('browser client minification etag');
	    self.io.set('log level', 1);
	});
	
	self.io.sockets.on('connection', function(socket) {
	    debug('New connection');
	    self.sockets.push(socket);
	    
	    socket.on("disconnect", function(){
		var i = self.sockets.indexOf(socket);
		if (i != -1){
		    self.sockets.splice(i, 1);
		}
	    });
	});

	// Methods
	self.broadcast = function(event, msg) {
	    self.sockets.forEach(function(socket, i, l){
		socket.emit("update", {event : event, msg : msg});
	    });
	};
    }
};

module.exports = Logman;

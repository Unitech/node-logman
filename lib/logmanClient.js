//     __
//    / /   ____  ____ _____ ___  ____ _____
//   / /   / __ \/ __ `/ __ `__ \/ __ `/ __ \
//  / /___/ /_/ / /_/ / / / / / / /_/ / / / /
// /_____/\____/\__, /_/ /_/ /_/\__,_/_/ /_/
//             /____/                      
//
// client for applications

var axon = require('axon'); 
var EventEmitter = require('events').EventEmitter;

/*
 * Singleton class
 * Instanciate it one time :
 * Logger.init({
 *   port : 3000,
 *   ip : '127.0.0.1'
 *  });
 *
 * Then use :
 * Logger.info({user : true});
 *
 */
module.exports = Logger = {
    init : function() {
	if (typeof options == 'undefined')
	    options = {};
	
	this.port = options.port || 3000;
	this.ip = options.ip || '127.0.0.1';
	
	this.sock = axon.socket('pub-emitter');
	
	this.events = this.sock.connect(this.port, this.ip);

	return this;
    },
    info : function(msg) {
	this.sock.emit('info', msg);
    },
    warn : function(msg) {
	this.sock.emit('warn', msg);
    },
    error : function(msg) {
	this.sock.emit('error', msg);
    },
    // for custom events
    throw : function(event, msg) {
	this.sock.emit(event, msg);
    }
};

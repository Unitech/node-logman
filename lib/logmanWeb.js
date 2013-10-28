//     __
//    / /   ____  ____ _____ ___  ____ _____
//   / /   / __ \/ __ `/ __ `__ \/ __ `/ __ \
//  / /___/ /_/ / /_/ / / / / / / /_/ / / / /
// /_____/\____/\__, /_/ /_/ /_/\__,_/_/ /_/
//             /____/
//
// client for the web
//

//
// Do JSONP requests without jQuery
//
// http://stackoverflow.com/questions/6132796/how-to-make-a-jsonp-request-from-javascript-without-jquery
var $jsonp = (function(){
  var that = {};

  that.send = function(src, options) {
    var callback_name = options.callbackName || 'callback',
	on_success = options.onSuccess || function(){},
	on_timeout = options.onTimeout || function(){},
	timeout = options.timeout || 10; // sec

    var timeout_trigger = window.setTimeout(function(){
      window[callback_name] = function(){};
      on_timeout();
    }, timeout * 1000);

    window[callback_name] = function(data){
      window.clearTimeout(timeout_trigger);
      on_success(data);
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;

    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return that;
})();

// Prevent console error throwing when IE
if (typeof console == "undefined") {
  this.console = {log: function() {}};
}


// Catch all client side error
window.onerror = function(message, uri, line) {
  if (window.logman.remote.exception == false)
    return false;
  
  var fullMessage = location.href + '\n' + uri + '\n' + line;
  var jsonError = {
    error : message,
    href : location.href,
    line : line
  };

  logman.sendToLogman('uncaught', jsonError);
  return false;
};

window.logman = {
  logman_url : 'http://localhost:4444',
  display : true,
  remote : {
    log : false,
    warn : true,
    error : true,
    exception : true
  },
  log : function(msg) {
    if (this.remote.log)
      this.sendToLogman('log', {msg : msg});
    if (this.display) console.log(msg);
  },
  warn : function(msg) {
    if (this.remote.warn)	    
      this.sendToLogman('warn', {msg : msg});
    if (this.display) console.log(msg);
  },
  error : function(msg) {
    if (this.remote.error)	    
      this.sendToLogman('error', {msg : msg});
    if (this.display) console.log(msg);
  },
  notify : function(event, msg) {
    this.sendToLogman(event, {msg : msg});
    if (this.display) console.log(msg);
  },
  sendToLogman : function(event, msg) {
    var url = this.logman_url + '/client/log/?event=' + event + '&data=' + encodeURIComponent(JSON.stringify(msg));
    
    $jsonp.send(url , {
      onSuccess : function() {
      }
    });
  },
  monitor : function() {
    // http://jiffy-web.googlecode.com/svn/trunk/javascript/jiffy.js
    var startTime = new Date();
    
    window.onload=function() {
      console.log(new Date() - startTime);
    };
  }
};


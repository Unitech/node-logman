# (DEPRECATED) node-logman

node-logman provide a log interface that you can embed in your Node app.

![Logman](https://github.com/Alexandre-Strzelewicz/Logman/raw/master/img/screen.png)

Install it

```
$ npm install logman -g
```



# Old

App with two loggers which permits to log client and server side events.

The server store the logs into Redis database and, if enabled, can disserve a realtime web interface to show you the last log messages.

Logman is here muha.


## Testing this fast

```
git clone git@github.com:Alexandre-Strzelewicz/Logman.git
cd Logman
npm install
cd examples
node server.js
```

In another term : 
```
node client.js
```

Then open your browser :
```
google-chrome "http://localhost:4444/#/server"
```

And see the realtime logs ;)

## Stack

- Redis
- Node/Express
- AngularJS
- Socket.io

## Standalone server

- Timestamp all logs received
- Store them to redis
- Realtime web interface if enabled

### API

This directly start the log server and the web interface : 

```javascript
var logServer = new LoggyServer({
    bind_port : 3044,             // logger port
    web_port : 4444,              // web interface port
    enableMonitoringPage : true,  // enable web interface
    enableClientSideLog : true    // enable routes for client side logging
});
```

## Client side logging - logmanWeb.js

In order to log client side messages you must include **logmanWeb.js** in your pages. Messages are sent to the Logman server via JSONP, it doesn't need jQuery or other dependencies. 

JSONP permits you to log events from web applications that runs under different domain names.

### API

When you include **logmanWeb.js** to your web app, it directly binds logman to the window js variable.

By default window.onerror is overidded to catch all uncaught errors and send them to Logman.

```javascript
--- Variables
logman.logman_url  // (str) Set the URL of the Logman server
logman.display     // (bool) Display logman logs - good for development
logman.remote(log/warn/error/exception) // Param which event should be sent to Logman

--- Methods
logman.log(msg)            // by default it just print a message
logman.warn(msg)           // send warn message to Logman
logman.error(msg)          // send error message to Logman
logman.notify(event, msg)  // send a custome event with msg to Logman

logman.monitor()           // Not implemented yet
```

## Server side logging - logmanClient.js

Logger for server side applications, send events and custom message to Logman. Available in lib/logmanClient.js

## Options

### Init

```javascript
var Logger = require('./path/to/logmanClient.js');

Logger.init({
   port : 3044,      // Port of the MessageBus.js server   
   ip : '127.0.0.1', // IP adress of the MessageBus.js server
   remote : true,    // Do the log should send data to MessageBus.js
   display : true    // Display log messages ? (for debug)
});
```

### Usage

#### Custom events

If you want to throw custom events (user:signup for example) :

```javascript
var log = require('./path/to/logmanClient.js').getCustomLogger();

// Will send { event : 'user:signup', msg : { dt : 'User alex registered' } }
log('user:signup', {dt : 'User alex registered'});
```

#### Prefixed custom events



#### Same event logger (TJ debug like)

If you want to use the same storage key (also a route with Messagebus.js):

```javascript
var log = require('./path/to/logmanClient.js').getLogger('user:registration');

// Will send { event : 'user:registration', msg : 'User registered'}
log({msg : 'User registered'});
```

## Express/Connect middleware logging - afflux-express.js

For documentation please reffer to : https://github.com/Alexandre-Strzelewicz/afflux-server.js

Just make sure that you use the same port for transiting the logs.

## License

(The MIT License)

Copyright (c) 2013 Wiredcraft <opensource@wiredcraft.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

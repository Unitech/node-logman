angular.module('Socketio', []).
  value('version', '0.1').
  factory('Socket', function ($rootScope) {
    var socket = null;
    return {
      init : function(url) {
          var aUrl = url || '/';
          socket = io.connect(aUrl);
      },
	close : function() {
            socket.disconnect();
        //socket = null;      
      },
      on: function (eventName, callback) {
        if (!socket) throw 'Socket not initialized'
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {if (!socket) throw 'Socket not initialized'
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        if (!socket) throw 'Socket not initialized'
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });

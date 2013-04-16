//     __
//    / /   ____  ____ _____ ___  ____ _____
//   / /   / __ \/ __ `/ __ `__ \/ __ `/ __ \
//  / /___/ /_/ / /_/ / / / / / / /_/ / / / /
// /_____/\____/\__, /_/ /_/ /_/\__,_/_/ /_/
//             /____/
//
// Web app
//

Loggy = angular.module('Loggy', ['Socketio', 'ngResource'])
    .config(function ($routeProvider) {
	$routeProvider
	    .when('/', {
		templateUrl: 'views/main.html',
		controller: 'AppCtrl'
	    })
	    .when('/client', {
		templateUrl: 'views/log.html',
		controller: 'ClientCtrl'
	    })
	    .when('/server', {
		templateUrl: 'views/log.html',
		controller: 'ServerCtrl'
	    })
	    .when('/server_connected', {
		templateUrl: 'views/server_connected.html',
		controller: 'ServerConnectedCtrl'
	    })
	    .otherwise({
		redirectTo: '/'
	    });
    });

Loggy.controller('NavbarCtrl', function ($scope, $location, Socket) {
    $scope.menu = [
	{title : 'Logman', url : '#'},
	{title : 'Client log', url : '#/client'},
	{title : 'Server log', url : '#/server'},
	{title : 'Servers connected', url : '#/server_connected'}
    ];

    $scope.isActive = function(panel) {
	if ($location.path() == panel.url.substring(1))
	    return true;
	return false;
    };
});

Loggy.controller('AppCtrl', function ($scope, $http) {
});

Loggy.controller('ServerConnectedCtrl', function ($scope, $http) {
    $http.get('/get_servers').success(function(data) {
	$scope.servers = data;
    });
});

Loggy.controller('ClientCtrl', function ($scope, $http, Socket) {
    Socket.init('/');

    function generate_menu() {
	var keys = [];
	for(var prop in $scope.logs){
	    keys.push(prop);
	}
	$scope.clientProps = keys;
    }
    
    Socket.on('connect', function(data) {
	$scope.realtime = 'V Realtime connected';
    });
    
    Socket.on('disconnect', function(){
	$scope.realtime = 'X Not connected in Realtime';
    });

    Socket.on('update', function(data) {	
	data.msg['new'] = true;
	try {
	    if (data.event.indexOf('client:') >= 0) {
		$scope.logs[data.event].unshift(data.msg);
	    }
	} catch (e) {
	    $scope.logs[data.event] = [];
	    $scope.logs[data.event].push(data.msg);
	    generate_menu();
	}
    });

    $http.get('/get_logs/client:*').success(function(data) {
	$scope.logs = data;
	generate_menu();
	$scope.propSelected = $scope.clientProps[0];
	$scope.logsView = $scope.logs[$scope.propSelected];
    });

    $scope.display = function(key) {
	$scope.propSelected = key;
	$scope.logsView = $scope.logs[key];
    };
    
    $scope.flush = function() {
	$http.post('/flushlogs').success(function() {
	    $scope.logs = [];
	});
    };
    
});


Loggy.controller('ServerCtrl', function ($scope, $http, Socket) {
        Socket.init('/');

    function generate_menu() {
	var keys = [];
	for(var prop in $scope.logs){
	    keys.push(prop);
	}
	$scope.clientProps = keys;
    }
    
    Socket.on('connect', function(data) {
	$scope.realtime = 'V Realtime connected';
    });
    
    Socket.on('disconnect', function(){
	$scope.realtime = 'X Not connected in Realtime';
    });

    Socket.on('update', function(data) {	
	data.msg['new'] = true;
	try {
	    if (data.event.indexOf('server:') >= 0) {
		$scope.logs[data.event].unshift(data.msg);
	    }
	} catch (e) {
	    $scope.logs[data.event] = [];
	    $scope.logs[data.event].push(data.msg);
	    generate_menu();
	}
    });

    $http.get('/get_logs/server:*').success(function(data) {
	$scope.logs = data;
	generate_menu();
	$scope.propSelected = $scope.clientProps[0];
	$scope.logsView = $scope.logs[$scope.propSelected];
    });

    $scope.display = function(key) {
	$scope.propSelected = key;
	$scope.logsView = $scope.logs[key];
    };
    
    $scope.flush = function() {
	$http.post('/flushlogs').success(function() {
	    $scope.logs = [];
	});
    };
});


Loggy.directive('logTable', function() {
    return {
	restrict: 'E',
	scope: {
	    logs: '=',
	    errorType : '='
	},
	templateUrl: '/views/logTable.html'
    };
});

Loggy.filter('fromNow', function() {
    return function(dateString) {
	return moment(new Date(dateString)).fromNow();
    };
});


function clone(obj){
    if(obj == null || typeof(obj) != 'object')
	return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
	temp[key] = clone(obj[key]);
    return temp;
}

Loggy.filter('beautify', function() {
    return function(log) {
	var cloned = clone(log);
	delete cloned['$$hashKey'];
	delete cloned['date'];
	return '<pre>'+JSON.stringify(cloned, null, 4) + '</pre>';
    };
});


//ui

var real = angular.module('real', ['ngRoute'])
.config(function ( $routeProvider ) {
	$routeProvider
	.when('/game', {
		templateUrl: '/partials/game.html',
		controller: 'GameCtrl'
	})
	.when('/', {
		templateUrl: '/partials/home.html',
		controller: 'RegisterCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
})
.controller('RegisterCtrl', function ($scope, AppState) {
	$scope.join = function (name) {
		AppState.register(name);
	};
})
.controller('PageCtrl', function ($scope, AppState) {
	$scope.title = AppState.user.name || "Join Game!";
})
.controller('GameCtrl', function ($scope, socket, AppState, $location) {
	if (!AppState.isRegistered()) {
		$location.url('/');
	}
	$scope.users = AppState.users;
	$scope.chat = {};
	$scope.chat.msgs = [];
	$scope.chat.message = "";
	$scope.broadcast = function (chat) {
		socket.emit('msg:send' ,{user: AppState.user, msg: chat.message})
		console.log(chat);
		if (chat.message && chat.message.length > 0) {
			chat.message = "";
		};
	};
	
	socket.on('msg:recieve', function (msg) {
		console.log(msg);
		$scope.chat.msgs.push(msg);
	});
})
.factory('AppState', function ($route, $location, socket) {

	var private = {
		isRegistered: false,
	}
	var state =  {
		user: {},
		register: function (username) {
			if (private.isRegistered) {
				throw new Error('already registered');
			} else {
				socket.emit('user:register', username);
				socket.on('connected', function (resp) {
					private.isRegistered = true;
					state.user = resp.user;
					state.users = resp.users;
					$location.url('/game')
				});
			}
		},
		isRegistered: function () {
			return private.isRegistered;
		},
	};
	return state;
})
.factory('socket', function ($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
}).directive('keybinding', function () {
	return {
		restrict: 'E',
		scope: {
			invoke: '&'
		},
		link: function (scope, el, attr) {
			Mousetrap.bind(attr.on, scope.invoke);
		}
	};
});
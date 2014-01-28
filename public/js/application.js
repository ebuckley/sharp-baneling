var real = angular.module('real', [])
.controller('PageCtrl', function ($scope, socket) {
	$scope.chat = {};
	$scope.chat.msgs = [];
	$scope.chat.message = "";
	$scope.broadcast = function (chat) {
		console.log(chat);
		if (chat.message && chat.message.length > 0) {
			socket.emit('msg:send', chat.message);
			chat.message = "";
		};
	};
	$scope.submit = function () {
		console.log('called it');
		$scope.broadcast($scope.message);
	}
	/*
	 * Socket on'ers
	 */
	socket.on('users', function (data) {
		$scope.activeUsers = data.count;
	});
	
	socket.on('msg:recieve', function (msg) {
		$scope.chat.msgs.push(msg);
	});
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
			console.log('linked');
			Mousetrap.bind(attr.on, scope.invoke);
		}
	};
});
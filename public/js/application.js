var real = angular.module('real', [])
.controller('PageCtrl', function ($scope, socket) {
	$scope.msg = "hi world, nice to meet you!";
	$scope.activeUsers = 0;

	socket.on('users', function (data) {
		$scope.activeUsers = data.count
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
});
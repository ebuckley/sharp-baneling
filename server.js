var express = require('express')
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

console.log("app started on port 3030")

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

server.listen(3030);

var map = {
	objs: [
		{x: 30, y: 30},
		{x: 300, y: 100},
		{x: 570, y: 30},
		{x: 30, y: 170}
	],
	dimensions: {
		width: 600,
		height: 200
	}
};
var activeUsers = 0
io.sockets.on('connection', function (socket) {
	socket.emit('map', map);
	activeUsers ++;
	io.sockets.emit('users', {count: activeUsers});
	socket.on('disconnect', function () {
		activeUsers --;
		io.sockets.emit('users', {count: activeUsers});
	});
});
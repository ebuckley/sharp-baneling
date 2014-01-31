var express = require('express')
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	hub = require('hubjs')();

console.log("app started on port 3030")

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 3030);

var userId = 0
var messages = 0;
var users = [];
io.sockets.on('connection', function (socket) {
	hub.emit('newConnection', socket);
});

hub.on('newConnection', function(socket) {
	console.log('new connection made');
	socket.on('msg:send', function (msg) {
		hub.emit('msg.send', msg);
	});
	socket.on('user:register', function (user) {
		hub.emit('user.register', {socket: socket, user: user});
	})
	socket.on('disconnect', function () {
		hub.emit('disconnect');
	});
});

hub.on('msg.send', function (message) {
	messages ++;
	//send the new message to all users
	io.sockets.emit('msg:recieve', {
		user: message.user,
		msg: message.msg
	});
});

hub.on('user.register', function (connection) {
	var newUser = {name:connection.user, id: ++userId}
	users.push(newUser);
	connection.socket.emit('connected', {
		user: newUser,
		users: users
	});
	io.sockets.emit('users', {count: users.length, users: users});
});

hub.on('disconnect', function () {
	io.sockets.emit('users', {count: users.length, users: users});
});
var express = require('express')
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

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


	// onners
	socket.on('msg:send', function (msg) {
		messages ++;
		//send the new message to all users
		io.sockets.emit('msg:recieve', {
			user: msg.user,
			msg: msg.msg
		});
	});
	socket.on('user:register', function (user) {
		var newUser = {name:user, id: ++userId}
		users.push(newUser);
		socket.emit('connected', {
			user: newUser,
			users: users
		});
		io.sockets.emit('users', {count: users.length, users: users});
	})
	socket.on('disconnect', function () {
		io.sockets.emit('users', {count: users.length, users: users});
	});
});
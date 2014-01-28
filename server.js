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


var activeUsers = 0
var messages = 0;
io.sockets.on('connection', function (socket) {

	activeUsers ++;
	io.sockets.emit('users', {count: activeUsers});

	// onners
	socket.on('msg:send', function (msg) {
		messages ++;
		//send the new message to all users
		io.sockets.emit('msg:recieve', {
			id: messages,
			content: msg
		});
	});
	socket.on('disconnect', function () {
		activeUsers --;
		io.sockets.emit('users', {count: activeUsers});
	});
});
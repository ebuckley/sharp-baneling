var app = require('express')(),
	server = require('http').createServer(app),
	io = require('socket.io');

app.listen(3030);
console.log("app started on port 3030")

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

var map = {

	objs: [
		{x: 30, y: 30},
		{x: 300, y: 100}
		{x: 570, y: 30}
		{x: 30, y: 170}
	];

	dimensions: {
		width: 600,
		height: 200
	}
};
var users = [];
io.sockets.on('connection', function (socket) {
	socket.emit('map', map);
	socket.on('')
});
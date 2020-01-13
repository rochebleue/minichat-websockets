const express = require('express');
var http = require("http");
const app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');

const server = http.Server(app);
const io = require('socket.io')(server);

var roles = [{name: 'admin'}, {name: 'mod'}, {name:'user'}, {name: 'banished'}];
var users = [];
var channels = [];
channels.push({name:'General', id:'chan0', messages:[]});

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

io.on('connection', (socket) => {
	io.sockets.connected[socket.id].emit('refresh channels', channels);

	socket.on('chat message', function(msg, pseudo, time, color, channel) {
	 	for (var i = channels.length - 1; i >= 0; i--) {
	 		if (channels[i].id == channel) {
	 			channels[i].messages.push({message:msg, pseudo:pseudo, time:time, color:color});
	 		}
	 	}
	    io.emit('chat message', msg, pseudo, time, color, channel);
	});

	socket.on('typing', function(pseudo) {
		io.emit('typing', pseudo);
	});

	socket.on('user connect', function(pseudo, color) {
		users.push({pseudo: pseudo, id: socket.id, color: color, role:roles[2]});
		console.log(users);
		io.emit('user connect', users);
		socket.emit('refresh messages', channels[0].messages);
	});

	 socket.on('disconnect', function() {
		console.log(socket.id+'Got disconnect!');
		io.emit('user disconnected', socket.id);
	 });

	socket.on('new channel', function(name) {
		channels.push({name: name, id: 'chan'+channels.length, messages:[]});
		io.emit('refresh channels', channels);
	});

	socket.on('color change', function(color) {
		for (var i = users.length - 1; i >= 0; i--) {
			if (users[i].id === socket.id) {
				users[i].color = color;
			}
			io.emit('users refresh', users);
		}
	});

	socket.on('switch channel', function(id) {
		for (var i = users.length - 1; i >= 0; i--) {
			if (users[i].id === socket.id) {
				users[i].channel = id;
			}
		}
		for (var i = channels.length - 1; i >= 0; i--) {
			if (channels[i].id == id) {
				socket.emit('refresh messages', channels[i].messages);
			}
		}
	});

});

// Ecoute sur l’objet Server (incluant l’app Express et Socket.io)
server.listen(9000, function () {
	console.log('Le serveur écoute sur le port 9000')
})
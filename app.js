var express        	= require('express');
var app            	= express();

var twitterCFG      = require('./config/twitter.js');

var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

var server = app.listen(port);
console.log('Magic happens on port ' + port);

// socket.io
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    socket.emit('message', 'Vous êtes bien connecté !');
});

var express        	= require('express');
var app            	= express();

var twitterCFG      = require('./config/twitter.js');

// Serveur web =================================================================
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

var server = app.listen(port);
console.log('Magic happens on port ' + port);

// Game variables ==============================================================
var highScore = {player: "dédé", score: 0};

// Socket.io ===================================================================
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    socket.emit('message', 'Vous êtes bien connecté !');
    socket.emit('highScore', highScore);

    socket.on('loose', function(data) {
        console.log(data.pseudo + " a perdu avec un score de " + data.score);
        if(data.score <= highScore.score)
            socket.emit('message', 'Vous avez perdou !');
        else {
            highScore.player = data.pseudo;
            highScore.score = data.score;
            socket.emit('message', 'Vous avez le nouveau record !');
            socket.emit('highScore', highScore);
        }
    });
});

// Affichage des tweets ========================================================
var Twitter = require('node-tweet-stream')
var t = new Twitter(twitterCFG)

t.on('tweet', function (tweet) {
    console.log('newTweet');
    io.sockets.emit('newTweet', tweet.text)
})

t.on('error', function (err) {
    console.error(err);
})


for (var i = 0; i < twitterCFG.hashtag.length; i++) {
    t.track('twitterCFG.hashtag[i]');
}

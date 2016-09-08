var open = require('open'),
    game = require('./game'),
    peer = require('./peer'),
    server = require('socket.io')(8081); // socket for the browser client

// open the browser client
open('http://localhost:8080');

// peer message handlers
peer.socket.on('connection', function (socket) {

    // synchronize with the generator
    peer.emit('getTheGame', null);

    peer.socket.on('joinTheGame', function (msg) {
        console.log('joinTheGame', msg);
        // TODO:  handle the joinTheGame event
    });

    peer.socket.on('guess', function (msg) {
        // TODO:  handle the guess event
    });

    peer.socket.on('getTheGame', function (msg) {
        // TODO: handle the getTheGame event
    });
});

// server message handlers
server.on('connection', function (socket) {

    // synchronize (send) the game data to the browser client
    server.emit('gameUpdated', game);

    // when the client send his credentials
    socket.on('joinTheGame', function (msg) {

        if (game.hasPlayerWithNickname(msg) == false) {
            game.addPlayer(msg);
        }

        // synchronize (send) the game data with the browser client
        server.emit('gameUpdated', game);

        // send the new nickname to the group
        peer.emit('joinTheGame', msg, function (err) {

        });
    });
});
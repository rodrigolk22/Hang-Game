var open = require('open'),
    game = require('./game'),
    peer = require('./peer'), // multicast socket for the peer
    browser = require('socket.io')(8081); // socket for the browser client

// open the browser client
open('http://localhost:8080');

// peer <-> peer message handlers
peer.socket.on('connection', function (socket) {

    // synchronize with the generator
    peer.emit('getTheGame', null);

    socket.on('gameUpdated', function (msg) {
        console.log('joinTheGame', msg);
        // TODO:  handle the joinTheGame event
    });

    socket.on('joinTheGame', function (msg) {
        console.log(msg, 'wants to join the game!');
        // TODO:  handle the joinTheGame event
    });

    socket.on('guess', function (msg) {
        // TODO:  handle the guess event
    });

    socket.on('getTheGame', function (msg) {
        // TODO: handle the getTheGame event
    });
});

// server <-> browser message handlers
browser.on('connection', function (socket) {

    // send the game data to the browser client
    browser.emit('gameUpdated', game.getGameData());

    // when the browser client send his credentials
    socket.on('joinTheGame', function (msg) {
        peer.emit('joinTheGame', msg);
    });

    // when the browser client send a guess
    socket.on('guess', function (msg) {
        peer.emit('guess', msg);
    });
});
/*
var pipeEvent = function (fromSocket, toSocket, type) {
    fromSocket.on(type, function (msg) {
        toSocket.emit(type, msg);
    });
};*/
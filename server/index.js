var open = require('open'),
    game = require('./game'),
    peer = require('./peer'),
    server = require('socket.io')(8081); // socket for the browser client

// open the browser client
open('http://localhost:8080');

peer.emit('getTheGame', null, function (err) {
    if (err) throw err;
});



// peer message handlers
peer.on('message', function (msg, rinfo) {

    console.log('peer got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port);

    if (msg == 'joinTheGame') {
        // TODO: add a joinTheGame message handler
    }

    // TODO: add a guess message handler
    if (msg == 'guess') {

    }

    if (msg == 'gameUpdated') {
        // TODO: add a gameUpdate message handler
    }
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
        peer.sendMessage('joinTheGame', function (err) {

        });
    });




});
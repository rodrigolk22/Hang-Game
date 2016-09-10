var config = require('./config'),
    game = require('./game'),
    peer = require('./peer'), // multicast socket for the peer
    browser = require('socket.io')(config.serverPort); // socket for the browser client

// peer <-> peer message handlers
peer.socket.on('listening', function () {

    // do initial game sync
    (function () {
        game.genUniqueID(function (myID) {

            // request to join the game
            peer.emit('joinTheGame', {id: myID});

            if (config.debug) {
                console.log('requested to join the game with ID', myID, '...');
                console.log('waiting 5s...');
            }

            // wait for 5s to sync with the peers
            setTimeout(function () {
                if (!game.hasGenerator()) {
                    console.log('now, I am the generator!');
                    game.setGeneratorId(myID);
                    alertBrowser();
                    alertPeers();
                }
            }, 5000);
        });
    })();

    // when the game has been updated
    peer.socket.on('gameUpdated', function (data) {
        game.updateGameData(data);
        alertBrowser();
    });

    // when someone has joined the game
    peer.socket.on('joinTheGame', function (data) {
        if (game.iAmTheGenerator()) {
            console.log(data, 'joined the game!');
            game.addPlayer(data.id);
            alertPeers();
        }
    });

    peer.socket.on('guess', function (data) {
        // TODO:  handle the guess event
    });
});

// server <-> browser message handlers
browser.on('connection', function (socket) {

    alertBrowser(); // update the client

    // when the browser client send a guess
    socket.on('guess', function (msg) {
        peer.emit('guess', msg);
    });
});

/**
 * Alert the peers that the game has been updated
 */
var alertPeers = function () {
    peer.emit('gameUpdated', game.getGameData());
};

/**
 * Alert the browser that the game has been updated
 */
var alertBrowser = function () {
    browser.emit('gameUpdated', game.getGameData());
};

/*
var pipeEvent = function (fromSocket, toSocket, type) {
    fromSocket.on(type, function (msg) {
        toSocket.emit(type, msg);
    });
};*/
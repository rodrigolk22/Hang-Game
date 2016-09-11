var config = require('./../config'),
    debug = require('./helpers/debug'),
    game = require('./game'),
    multicast = require('./multicast'), // multicast socket for the peer
    browser = require('socket.io')(config.serverPort); // socket for the browser client

// do initial game sync
game.init(function () {

    var myID = game.getMyId();

    // request to join the game
    multicast.emit('joinTheGame', {
        id: myID
    });

    debug('requested to join the game with ID ' + myID);
    debug('waiting 5s...');

    // wait for 5s to sync with the peers
    setTimeout(function () {
        if (game.statusIs('NOT_SYNCED')) {
            game.addPlayer(myID);
            game.setStatus('WAITING_PLAYERS');
            debug('now, I am the generator!');
            alertBrowser();
            alertPeers();
        } else {
            debug('now, I am an player!');
        }
    }, 5000);
});

// peer <-> peer message handlers
multicast.socket.on('listening', function () {

    // when the game has been updated
    multicast.socket.on('gameUpdated', function (data) {
        if (game.iAmTheGenerator() == false) {
            game.setGameData(data);
            alertBrowser();
        }
    });

    // when someone has joined the game
    multicast.socket.on('joinTheGame', function (data) {
        if (game.iAmTheGenerator()) {

            game.addPlayer(data.id);

            // start the game if not started yet
            if (game.statusIs('WAITING_PLAYERS') && game.canStart()) {
                game.startRound();
            }

            alertPeers();
        }
    });

    // when someone has guessed
    multicast.socket.on('guess', function (data) {
        // TODO:  handle the guess event
    });
});

// server <-> browser message handlers
browser.on('connection', function (socket) {

    // when the browser client send a guess
    socket.on('guess', function (msg) {
        multicast.emit('guess', msg);
    });
});

/**
 * Alert the peers that the game has been updated
 */
var alertPeers = function () {
    multicast.emit('gameUpdated', game.getGameData());
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
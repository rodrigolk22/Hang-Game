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

            /**
             * I am the first player, then I need to
             * become the generator
             */
            game.addPlayer(myID);
            debug('now, I am the generator!');

            game.startWaitingPlayers();

            alertPeers();
        } else {
            debug('now, I am an player!');
        }
        alertBrowser();
    }, 5000);
});

// peer <-> peer message handlers
multicast.socket.on('listening', function () {

    // when the game has been updated
    multicast.socket.on('gameUpdated', function (data) {
        if (game.iAmAnPlayer()) {
            game.setGameData(data);
            alertBrowser();
        }
    });

    // when the last generator has been changed
    multicast.socket.on('nextGenerator', function (data) {
        game.setGameData(data);

        // if i Am the new generator
        if (game.iAmTheGenerator()) {
            game.startRound();

            alertPeers();
            alertBrowser();
        }
    });

    // when someone has joined the game
    multicast.socket.on('joinTheGame', function (data) {
        if (game.iAmTheGenerator()) {
            game.addPlayer(data.id);

            // start the game if is not started yet
            if (game.statusIs('WAITING_PLAYERS') && game.canStart()) {
                game.startRound();
            }

            alertPeers();
            alertBrowser();
        }
    });

    // when someone has sent a choice (an character)
    multicast.socket.on('choice', function (data) {
        if (game.iAmTheGenerator() && game.statusIs('WAITING_CHOICE')) {

            // TODO: verify if the user that has sent a choice is the correct user

            var player = game.getCurrentPlayer();
            var char = data.choice;

            game.markCharacterAsNonavailable(char);

            // for every character, the player receive +1 point
            player.roundPoints += game.countCharactersInCurrentWord(char);

            game.startWaitingGuess();

            alertPeers();
            alertBrowser();
        }
    });

    // when someone has guessed (an word)
    multicast.socket.on('guess', function (data) {
        if (game.iAmTheGenerator() && game.statusIs('WAITING_GUESS')) {

            // TODO: verify if the user that has guessed is the correct user

            var player = game.getCurrentPlayer();
            var guess = data.guess;

            if (guess == null) {
                // pass the turn
                game.nextPlayer();
                game.startWaitingChoice();

            } else if (game.isCorrectGuess(guess)) {

                // guessed the correct word, add +5 points to the player and end the round
                player.roundPoints += 5;

                game.endRound(function () {
                    multicast.emit('nextGenerator', game.getGameData());
                });

                return;

            } else {
                // guessed the wrong word
                player.roundPoints -= 1;
                game.nextPlayer();
                game.startWaitingChoice();
            }

            alertPeers();
            alertBrowser();
        }
    });
});

// server <-> browser message handlers
browser.on('connection', function (socket) {

    // when the browser client send a choice
    socket.on('choice', function (msg) {
        multicast.emit('choice', msg);
    });

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
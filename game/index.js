var config = require('./../config'),
    debug = require('./helpers/debug'),
    game = require('./game'),
    multicast = require('./multicast'), // multicast socket for the peer
    browser = require('socket.io')(config.serverPort); // socket for the browser client

/**
 * When there is no enought players until timeout
 */
game.events.on('waitingPlayersTimeout', function () {

    // start the game if is not started yet
    if (game.canStart()) {
        game.startRound();
    } else {
        game.startWaitingPlayers();
    }

    alertBrowser();
    alertPeers();
});

/**
 * When the current player haven't sent a choice until timeout
 */
game.events.on('waitingChoiceTimeout', function () {
    var player = game.getCurrentPlayer();

    player.faults ++;

    // if the player hasn't responded for more than maxPlayerFaults
    if (player.faults > config.maxPlayerFaults) {
        game.removePlayer(player.id);
        debug(player.nickname + "hasn't respondend for " + config.maxPlayerFaults + ' turns,' +
            ' and was droped from the game');
    } else {
        game.startWaitingChoice();
    }

    alertBrowser();
    alertPeers();
});

/**
 * When the current player haven't sent a guess until timeout
 */
game.events.on('waitingGuessTimeout', function () {
    var player = game.getCurrentPlayer();

    player.faults ++;

    // if the player hasn't responded for more than maxPlayerFaults
    if (player.faults > config.maxPlayerFaults) {

        game.nextPlayer();
        game.startWaitingGuess();

        game.removePlayer(player.id);
        debug(player.nickname + "hasn't respondend for " + config.maxPlayerFaults + ' turns,' +
            ' and was droped from the game');
    } else {
        game.startWaitingGuess();
    }

    alertBrowser();
    alertPeers();
});

/**
 * When the winner has been announced, then change the generator and
 * send a nextGenerator message in order to the next generator woke up;
 */
game.events.on('announcingWinnerTimeout', function () {
    game.nextGenerator();
    multicast.emit('nextGenerator', game.getGameData());
});

/**
 * When an player is removed, then verify if the game
 * can continue or wait for more players
 */
game.events.on('playerRemoved', function () {
    if (!game.canStart()) {
        game.startWaitingPlayers();
    }
    alertBrowser();
    alertPeers();
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
            game.addPlayer(data);
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

            // for every character, the player receive +1 point per character
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
                game.endRound();

            } else {
                // guessed the wrong word, remove 1 point
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

module.exports = function (nickname) {

    // do initial game sync
    game.init(function () {

        var player = {
            id: game.getMyId(),
            nickname: nickname
        };

        // request to join the game
        multicast.emit('joinTheGame', player);

        // wait for syncTime to sync with the peers
        setTimeout(function () {
            if (game.statusIs('NOT_SYNCED')) {
                game.addPlayer(player);
                game.startWaitingPlayers();
                alertPeers();
                debug('now, I am the generator!');
            } else {
                debug('now, I am an player!');
            }

            alertBrowser();
        }, config.syncTime);
    });
};
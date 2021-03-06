var config = require('./../config'),
    debug = require('./helpers/debug'),
    crypto = require('./crypto'),
    certGem = require('./helpers/certGem'),
    game = require('./game'),
    multicast = require('./multicast'), // multicast socket for the peer
    browser = require('socket.io')(config.serverPort); // socket for the browser client

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

            var player = game.getCurrentPlayer();

            // decrypt data using the publicKey of the player
            data = crypto.decryptWithPublicKey(data, player.publicKey);

            // if havn't decrypted, do nothing
            if (typeof data != 'object') {
                return;
            }

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

            var player = game.getCurrentPlayer();

            // decrypt data using the publicKey of the player
            data = crypto.decryptWithPublicKey(data, player.publicKey);

            // if havn't decrypted, do nothing
            if (typeof data != 'object') {
                return;
            }

            var guess = data.guess;

            if (guess == null) {

                // only pass the turn
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

/**
 * When there is not enought players until timeout
 */
game.events.on('waitingPlayersTimeout', function () {

    // start the game if is not started yet
    if (game.canStart()) {
        game.startRound();
    } else {
        game.startWaitingPlayers(); // repeat
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

    if (player.faults > config.maxPlayerFaults) {
        // the player hasn't responded for more than maxPlayerFaults
        game.removePlayer(player.id);
        debug(player.nickname + "hasn't respondend for " + config.maxPlayerFaults + ' turns,' +
            ' and was droped from the game');
    } else {
        // player can have more faults until fail, then repeat restart waiting for a choice
        game.nextPlayer();
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

    if (player.faults > config.maxPlayerFaults) {
        // remove the failed player
        game.removePlayer(player.id);
        debug(player.nickname + "hasn't respondend for " + config.maxPlayerFaults + ' turns,' +
            ' and was droped from the game');
    } else {
        // player can have more faults until fail, then repeat restart waiting for a guess
        game.nextPlayer();
        game.startWaitingChoice();
    }

    alertBrowser();
    alertPeers();
});

/**
 * When the winner has been announced, then change the generator and
 * send a nextGenerator message in order to the next generator wake up;
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

// server <-> browser message handlers
browser.on('connection', function (socket) {

    // when the browser client send a choice
    socket.on('choice', function (msg) {

        // encrypt before send
        var myPrivateKey = game.getMe().privateKey;
        msg = crypto.encryptWithPrivateKey(msg, myPrivateKey);

        multicast.emit('choice', msg);
    });

    // when the browser client send a guess
    socket.on('guess', function (msg) {

        // encrypt before send
        var myPrivateKey = game.getMe().privateKey;
        msg = crypto.encryptWithPrivateKey(msg, myPrivateKey);

        multicast.emit('guess', msg);
    });
});

module.exports = function (nickname) {

    // generate an RSA keys named with nickname
    certGem.generate(nickname, function (privateKey, publicKey) {

        var me = game.setMe({
            nickname: nickname,
            privateKey: privateKey,
            publicKey: publicKey
        });

        // request to join the game
        multicast.emit('joinTheGame', me);

        game.startWaitingSync();
        alertBrowser();

        /**
         * When the syncing time has passed without
         * receiving any data from peers
         */
        game.events.on('waitingSyncTimeout', function () {

            game.addPlayer(me);
            game.startWaitingPlayers();

            debug('now, I am the generator!');

            alertPeers();
            alertBrowser();
        });

        // update the browser whatever has hapened
        setTimeout(function () {
            alertBrowser();
        }, config.waitingSyncTime);
    });
};
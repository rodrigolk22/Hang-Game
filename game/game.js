var _ = require('underscore'),
    EventEmmiter = require('events'),
    config = require('./../config'),
    alphabet = require('./helpers/alphabet'),
    generator = require('./helpers/generator'),
    circularList = require('./helpers/circularList');

var events = new EventEmmiter();
var timeout = null;

/**
 * Status of the game (see 'statuses' for the possible values)
 * @type {boolean}
 */
var status = 'NOT_SYNCED'; // first status needs to be NOT_SYNCED

/**
 * An timer to set timeouts in order to handle peer failures
 * @type {null}
 */
var timer = null;

/**
 * My peer ID
 * @type {number}
 */
var myID = -1;

/**
 * My peer Nickname
 * @type {string}
 */
var myNickname = '';

/**
 * Game Players
 * List of player objects
 * @type {Array}
 */
var players = [];

/**
 * Game generators
 * List of players ID that will be the next generators
 * @type {Array}
 */
var generators = [];

/**
 * Possible game statuses
 * @type {string[]}
 */
var statuses = [
    'NOT_SYNCED', // when the node dont know the game data
    'WAITING_PLAYERS', // when the game doesn't started because has not enought players
    'WAITING_CHOICE', // waiting a choice
    'WAITING_GUESS', // waiting a guess
    'ANNOUNCING_WINNER', // announcing a winner
    // ...
];

/**
 * The current generated word that need to be guessed
 * Only the generator can see this word
 * @type {null}
 */
var currentWord = null;

/**
 * The current generate word, but with available characters supressed,
 * for example ANAB*LL*, if E is already choosen.
 * All the peers can see this word.
 * @type {null}
 */
var currentSupressedWord = null;

/**
 * Current available characters for player choices
 * @type {Array}
 */
var availableCharacters = [];

/**
 * Change the game status
 * @param newStatus
 */
var setStatus = function (newStatus) {
    if (statuses.indexOf(newStatus) == -1) {
        throw (status + " isn't a valid game status");
    }
    status = newStatus;
};

/**
 * Verify if the current game status is equals an status
 * @param statusIs
 * @returns {boolean}
 */
var statusIs = function (statusIs) {
    return status === statusIs;
};

/**
 * Set the timer to the future (now() + milis)
 * @param milis milisseconds to add to now()
 * @param callback to be executed on timeout
 */
var setTimer = function (milis, callback) {

    // set the timer to the future time
    timer = (new Date()).getTime() + milis;

    // clear the last timeout
    clearTimeout(timeout);

    // set the new timeout
    timeout = setTimeout(callback, milis);
};

/**
 * Get the gurrent generator ID
 * return null if there is no generator yet
 * @returns {*|null}
 */
var getCurrentGeneratorId = function () {
    return circularList.first(generators) || null;
};

/**
 * Return true if my process is the generator
 * @returns {boolean}
 */
var iAmTheGenerator = function () {
    return getCurrentGeneratorId() == myID && myID !== -1;
};

/**
 * Return true if my process is an player
 * @returns {boolean}
 */
var iAmAnPlayer = function () {
    return getCurrentGeneratorId() != myID && myID !== -1;
};

/**
 * Get the current player data
 */
var getCurrentPlayer = function () {
    return circularList.first(players) || null;
};

var getCurrentGenerator = function () {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == getCurrentGeneratorId()) {
            return players[i];
        }
    }
    return null;
};

var hasGenerator = function () {
    return getCurrentGeneratorId() !== -1;
};

/**
 * Verify if a player with this ID already joined the game
 * @param id
 * @returns {boolean}
 */
var hasPlayerWithId = function (id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == id) {
            return true;
        }
    }
    return false;
};

/**
 * Add a new player (with zero points and empty nickname) to the game
 * @param id
 */
var addPlayer = function (player) {

    if (hasPlayerWithId(player.id)) {
        throw ('another player with id ' + player.id + ' already joined the game');
    }

    circularList.add(generators, player.id);

    circularList.add(players, {
        id: player.id,
        nickname: player.nickname,
        totalPoints: 0,
        roundPoints: 0,
        faults: 0
    });

    return true;
};

var removePlayer = function (playerId) {

    // remove from generators list
    var index = generators.indexOf(playerId);
    if (index > -1) {
        generators.splice(index, 1);
    }

    // remove from players list
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == playerId) {
            players.splice(i, 1);
        }
    }

    events.emit('playerRemoved');

    return true;
};

/**
 * Get the player with ID
 * @param id
 * @returns {*}
 */
var getPlayer = function (id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == id) {
            return players[i];
        }
    }
    return null;
};

/**
 * Get the game data to send to the peers
 * @returns {{timer: null, currentSupressedWord, availableCharacters: Array, status: boolean, players: Array, generators: Array}}
 */
var getGameData = function () {
    return {
        me: {
            id: myID,
            nickname: myNickname
        },
        timer: timer,
        currentPlayer: getCurrentPlayer(),
        currentGenerator: getCurrentGenerator(),

        currentSupressedWord: currentSupressedWord,
        availableCharacters: availableCharacters,
        status: status,
        players: players,
        generators: generators
    }
};

/**
 * Update the game data from gameData object
 * @param gameData
 */
var setGameData = function (gameData) {
    timer = gameData.timer;
    currentSupressedWord = gameData.currentSupressedWord;
    availableCharacters = gameData.availableCharacters;
    status = gameData.status;
    players = gameData.players;
    generators = gameData.generators;
};

/**
 * Return this peer ID
 */
var getMyId = function () {
    return myID;
};

/**
 * Set and return my nickname and ID
 * @param nickname
 */
var setMe = function (nickname) {
    // generate the ID when is requested the first time
    if (myID == -1) {
        myID = require('./helpers/identificator');
    }

    myNickname = nickname;

    return {
        id: myID,
        nickname: nickname
    }
};

/**
 * Return true if the game can be started
 * @returns {boolean}
 */
var canStart = function () {
    // The game only starts if there is at least config.minPlayers and has an elected generator
    return players.length >= config.minPlayers && hasGenerator();
};

/**
 * Get and set the next generator
 */
var nextGenerator = function () {
    circularList.next(generators);
};

/**
 * Get and set the next player
 */
var nextPlayer = function () {
    circularList.next(players);

    // the next player cant be the generator
    if (getCurrentPlayer().id == getCurrentGeneratorId()) {
        circularList.next(players);
    }
};

/**
 * Update the currentSupressedWord (mark availableCharacters as '*')
 */
var updateSupressedWord = function () {

    var word = currentWord;
    for (var i = 0; i < availableCharacters.length; i++) {
        var regex = new RegExp(availableCharacters[i], 'g');
        word = word.replace(regex, '*');
    }

    currentSupressedWord = word;
};

/**
 * Start a game round
 */
var startRound = function () {

    // seting players round points to zero
    _.each(players, function (player) {
        player.roundPoints = 0;
    });

    // set the next player
    nextPlayer();

    // generate a new word, and update the supressed word
    currentWord = generator.generate();

    // restart the available characters
    availableCharacters = alphabet;

    updateSupressedWord();

    // change the status to waiting choice
    startWaitingChoice();
};

/**
 * End a game round
 * @param callback executed 10s after announced the winner
 */
var endRound = function () {

    // remove all available characters
    availableCharacters = [];
    updateSupressedWord();

    // sum players total points
    _.each(players, function (player) {
        player.totalPoints += player.roundPoints;
    });

    // change the status to announcing winner
    startAnnouncingWinner();
};

/**
 * Start a choice turn
 */
var startWaitingChoice = function () {
    setStatus('WAITING_CHOICE');
    setTimer(config.waitingChoiceTime, function () {
        if (statusIs('WAITING_CHOICE')) {
            events.emit('waitingChoiceTimeout');
        }
    });
};

/**
 * Start a guess turn
 */
var startWaitingGuess = function () {
    setStatus('WAITING_GUESS');
    setTimer(config.waitingGuessTime, function () {
        if (statusIs('WAITING_GUESS')) {
            events.emit('waitingGuessTimeout');
        }
    });
};

/**
 * Start waiting players
 */
var startWaitingPlayers = function () {
    setStatus('WAITING_PLAYERS');
    setTimer(config.waitingPlayersTime, function () {
        if (statusIs('WAITING_PLAYERS')) {
            events.emit('waitingPlayersTimeout');
        }
    });
};

/**
 * Start announcing winner
 */
var startAnnouncingWinner = function () {
    setStatus('ANNOUNCING_WINNER');
    setTimer(config.announcingWinnerTime, function () {
        if (statusIs('ANNOUNCING_WINNER')) {
            events.emit('announcingWinnerTimeout');
        }
    });
};

/**
 * Start waiting a syncronization with other players
 */
var startWaitingSync = function () {
    setStatus('NOT_SYNCED');
    setTimer(config.waitingSyncTime, function () {
        if (statusIs('NOT_SYNCED')) {
            events.emit('waitingSyncTimeout');
        }
    });
};

/**
 * Return true if guess is equals the current word
 */
var isCorrectGuess = function (guess) {
    return (guess === currentWord)
};

/**
 * Mark the character as nonavailable for the next choices
 */
var markCharacterAsNonavailable = function (character) {

    // remove the character from availableCharacters array
    var index = availableCharacters.indexOf(character);
    if (index > -1) {
        availableCharacters.splice(index, 1);
    }

    // update the supressed word
    updateSupressedWord();
};

/**
 * Return the amount of character in the current word
 * For example, if the word id POTATOES and character is T,
 * then return 2. If the word is ANABELLE and character is Z,
 * then return 0.
 */
var countCharactersInCurrentWord = function (character) {
    var count = 0;
    for (var i = 0; i < currentWord.length; i++) {
        if (currentWord[i] == character) {
            count ++;
        }
    }
    return count;
};

module.exports = {
    events: events,

    canStart: canStart,

    startRound: startRound,
    endRound: endRound,

    nextGenerator: nextGenerator,
    nextPlayer: nextPlayer,

    markCharacterAsNonavailable: markCharacterAsNonavailable,
    countCharactersInCurrentWord: countCharactersInCurrentWord,

    getCurrentPlayer: getCurrentPlayer,
    isCorrectGuess: isCorrectGuess,

    statusIs: statusIs,

    iAmTheGenerator: iAmTheGenerator,
    iAmAnPlayer: iAmAnPlayer,

    getGameData: getGameData,
    setGameData: setGameData,

    addPlayer: addPlayer,
    removePlayer: removePlayer,

    setMe: setMe,

    // status changes
    startWaitingPlayers: startWaitingPlayers,
    startWaitingChoice: startWaitingChoice,
    startWaitingGuess: startWaitingGuess,
    startWaitingSync: startWaitingSync
};
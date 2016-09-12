var _ = require('underscore'),
    alphabet = require('./helpers/alphabet'),
    generator = require('./helpers/generator');

/**
 * Status of the game (see 'statuses' for the possible values)
 * @type {boolean}
 */
var status = 'NOT_SYNCED';

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
 * @type {Array}
 */
var players = [];

/**
 * Game generators
 * @type {Array}
 */
var generators = [];

var statuses = [
    'NOT_SYNCED', // when the node dont know the game data
    'WAITING_PLAYERS', // when the game not start because has not enought players
    'WAITING_GUESS', // waiting a guess
    // ...
];

var currentWord = null;

var usedCharacters = [];

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
 * Get the gurrent generator ID
 * return null if there is no generator yet
 * @returns {*|null}
 */
var currentGeneratorId = function () {
    return _.first(generators) || null;
};

/**
 * Return true if my process is the generator
 * @returns {boolean}
 */
var iAmTheGenerator = function () {
    return currentGeneratorId() == myID && myID !== -1;
};

/**
 * Return true if my process is an player
 * @returns {boolean}
 */
var iAmAnPlayer = function () {
    return currentGeneratorId() != myID && myID !== -1;
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
var addPlayer = function (id) {

    if (hasPlayerWithId(id)) {
        throw ('another player with id ' + id + ' already joined the game');
    }

    generators.push(id);

    players.push({
        id: id,
        nickname: '',
        gamePoints: 0,
        roundPoints: 0
    });

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
 * @returns {{players: Array}}
 */
var getGameData = function () {
    return {
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
 * Return true if the game can be started
 * @returns {boolean}
 */
var canStart = function () {
    // The game only starts if there is at least 3 peers (one generator and 2 players)
    return players.length >= 3 && hasGenerator();
};

var startRound = function () {

    // TODO: get the first player

    //

    // TODO: concatenar pontos da rodada anterior
    // TODO: zerar pontos da rodada anterior


    // generate a new word
    currentWord = generator.generate();
};

/**
 * Initiate the game data for this process
 * @param successCallback
 */
var init = function (successCallback) {

    // get the unique identificator for this machine + PID
    require('./helpers/identificator')(function (id) {
        myID = id;
        successCallback();
    });
};

module.exports = {
    init: init,

    statusIs: statusIs,
    setStatus: setStatus,

    canStart: canStart,
    startRound: startRound,

    iAmTheGenerator: iAmTheGenerator,
    iAmAnPlayer: iAmAnPlayer,

    getGameData: getGameData,
    setGameData: setGameData,

    addPlayer: addPlayer,
    getPlayer: getPlayer,

    getMyId: getMyId
};
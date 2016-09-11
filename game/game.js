/**
 * Status of the game (see 'statuses' for the possible values)
 * @type {boolean}
 */
var status = 'NOT_SYNCED';

/**
 * ID of the generator peer
 * @type {number}
 */
var generatorID = -1;

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

var statuses = [
    'NOT_SYNCED', // when the node dont know the game data
    'WAITING_PLAYERS', // when the game not start because has not enought players
    'WAITING_GUESS', // waiting a guess
    // ...
];

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
 * Return true if my machine is the generator process
 * @returns {boolean}
 */
var iAmTheGenerator = function () {
    return myID === generatorID && myID !== -1;
};

/**
 * Return true if the game already has an generator peer
 * @returns {boolean}
 */
var hasGenerator = function () {
    return generatorID !== -1;
};

/**
 * Set the game generator peer ID
 * @param id
 */
var setGeneratorId = function (id) {
    generatorID = id;
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
        throw ('an another player with id ' + id + ' already joined the game');
    }

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
        players: players
    }
};

/**
 * Update the game data from gameData object
 * @param gameData
 */
var setGameData = function (gameData) {
    status = gameData.status;
    players = gameData.players;
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
    return players.length >= 3;
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

    setGeneratorId: setGeneratorId,
    iAmTheGenerator: iAmTheGenerator,
    hasGenerator: hasGenerator,

    getGameData: getGameData,
    setGameData: setGameData,

    addPlayer: addPlayer,
    getPlayer: getPlayer,

    getMyId: getMyId
};
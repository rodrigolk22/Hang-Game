var machineId = require('ee-machine-id');

/**
 * The game has started?
 * @type {boolean}
 */
var started = false;

/**
 * ID of the generator peer
 * @type {number}
 */
var generatorId = -1;

/**
 * My peer ID
 * is a unique ID for the machine running the NodeJS process.
 * The ID is created using all MAC addresses of the system, the cpu model and the systems total memory amount.
 * The ID is returned in form of a md5 hash.
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
 * Return true if my machine is the generator process
 * @returns {boolean}
 */
var iAmTheGenerator = function () {
    return myID === generatorId && myID !== -1;
};

/**
 * Return true if the game already has an generator peer
 * @returns {boolean}
 */
var hasGenerator = function () {
    return generatorId !== -1;
};

/**
 * Set the game generator peer ID
 * @param id
 */
var setGeneratorId = function (id) {
    generatorId = id;
};

/**
 * Verify if a player with this ID already joined the game
 * @param id
 * @returns {boolean}
 */
var hasPlayerWithId = function (id) {
    for (var i = 0; i < players.length; i++) {
        if (this.players[i].id == id) {
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
        console.log('This player already exists!');
        return false;
    }

    players.push({
        id: id,
        nickname: '',
        points: 0
    });

    return true;
};

/**
 * Get the player with ID
 * @param nickname
 * @returns {*}
 */
var getPlayer = function (id) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id == id) {
            return this.players[i];
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
        started: started,
        myNickname: myNickname,
        players: players
    }
};

/**
 * Update the game data from gameData object
 * @param gameData
 */
var updateGameData = function (gameData) {
    // TODO: get the gameData and update this file variables
};

/**
 * Return this peer ID
 */
var getMyId = function () {
    return this.myID;
};

/**
 * Return true if the game has already started
 * The game only starts if there is at least 3 peers (one generator and 2 players)
 * @returns {boolean}
 */
hasStarted = function () {
    return started === true;
};

/**
 * Set the game start
 * @param boolean
 */
setStarted = function (boolean) {
    started = boolean;
};

/**
 * Return true if the game can be started
 * @returns {boolean}
 */
canStart = function () {
    // The game only starts if there is at least 3 peers (one generator and 2 players)
    return players.length >= 3;
};

// prepare the game data
var genUniqueID = function (callback) {

    // create this peer ID
    machineId.get(function (id) {

        // set this peer ID
        this.myID = id;

        // execute callback
        callback(id);
    });
};

module.exports = {
    setGeneratorId: setGeneratorId,
    iAmTheGenerator: iAmTheGenerator,
    hasGenerator: hasGenerator,
    genUniqueID: genUniqueID,
    getGameData: getGameData,
    updateGameData: updateGameData,
    addPlayer: addPlayer,
    getPlayer: getPlayer
};
/**
 * The game has started?
 * @type {boolean}
 */
var started = false;

/**
 * This peer has acknowledged the game data?
 * @type {boolean}
 */
var synced = false;

/**
 * ID of the generator peer
 * @type {string}
 */
var generatorId = null;

/**
 * My peer Nickname
 * @type {string}
 */
var myNickname = '';

/**
 * My peer ID
 * @type {null}
 */
var myId = null;

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
    return myId == generatorId;
};

/**
 * Verify if a player with this nickname already joined the game
 * @param nickname
 * @returns {boolean}
 */
var hasPlayerWithNickname = function (nickname) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].nickname == nickname) {
            return true;
        }
    }
    return false;
};

/**
 * Add a new player (with zero points) to the game
 * @param nickname
 */
var addPlayer = function (nickname) {

    if (hasPlayerWithNickname(nickname)) {
        console.log('This player already exists!');
        return false;
    }

    players.push({
        nickname: nickname,
        points: 0
    });

    return true;
};



/**
 * Get the player with nickname
 * @param nickname
 * @returns {*}
 */
var getPlayer = function (nickname) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].nickname == nickname) {
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
        synced: synced,
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

module.exports = {
    getGameData: getGameData,
    updateGameData: updateGameData,
    addPlayer: addPlayer,
    getPlayer: getPlayer
};
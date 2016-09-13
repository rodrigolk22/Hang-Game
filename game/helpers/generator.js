var randomWords = require('random-words');

/**
 * Generate a random word
 * @returns {string}
 */
var generate = function () {
    return randomWords();
};

module.exports = {
    generate: generate
};
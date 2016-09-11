var words = [
    'dinossauro',
    'galinha',
    'ovo',
    'planta',
    'pessoa',
    'jardim'
];

/**
 * A random number between min inclusive and max inclusive
 * @param min
 * @param max
 * @returns {*}
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random word
 * @returns {string}
 */
var generate = function () {
    return words[getRandomIntInclusive(0, words.length - 1)];
};

module.exports = {
    generate: generate
};
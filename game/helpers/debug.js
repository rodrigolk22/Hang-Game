var config = require('./../../config');

module.exports = function debug (message) {
    if (config.debug) {
        console.log(message);
    }
};
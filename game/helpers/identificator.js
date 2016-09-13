var uid = require('uid');

/**
 * Generate an ID with 5 initial characters and the process ID on the end
 * @param callback
 */
module.exports = uid(5) + process.pid;
var uid = require('uid');

/**
 * Generate an unique ID for the machine running the NodeJS process.
 * The ID is created using all MAC addresses of the system, the cpu model and the systems total memory amount.
 * The ID is returned in form of a md5 hash with de PID suffix
 * @param callback
 */
module.exports = function (callback) {
    var UID = uid(5) + process.pid;
    callback(UID);
};
var machineId = require('ee-machine-id');

/**
 * Generate an unique ID based on the MAC adressess and this process ID
 * @param callback
 */
module.exports = function (callback) {
    machineId.get(function (id) {
        var UID = id + process.pid;
        callback(UID);
    });
};
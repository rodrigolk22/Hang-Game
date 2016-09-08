var dgram = require('dgram');
var config = require('./config');

var socket = dgram.createSocket('udp4');

socket.on('error', function (err)  {
    socket.close();
    if (config.debug) {
        console.log('socket error: ' + err);
    }
});

socket.on('close', function ()  {
    if (config.debug) {
        console.log('socket closed');
    }
});

socket.on('listening', function () {
    if (config.debug) {
        var address = socket.address();
        console.log('listening at: ' + address.address + ':' + address.port);
    }
});

socket.on('message', function (msg, rinfo) {
    console.log('peer got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port);
});

/**
 * Send an object to the group
 * @param obj
 * @param errorCallback
 */
socket.sendObject = function (obj, callback) {
    var buffer = Buffer.from(obj);
    socket.send(buffer, config.multicastPort, config.multicastGroup, function (err) {
        callback(err);
    });
};

/**
 * Start a socket listening on @address at @port and join the @multicastGroup
 * @param port
 * @param address
 * @param multicastGroup
 */
socket.start = function (port, multicastGroup) {

    port = port || config.defaultPort;
    multicastGroup = multicastGroup || config.multicastGroup;

    // bind the socket to an open port
    socket.bind(port, function () {

        // config multicast
        //socket.setBroadcast(true);
        socket.setMulticastTTL(128);

        // dont receive own messages
        socket.setMulticastLoopback(false);

        // join the group
        socket.addMembership(multicastGroup);

        if (config.debug) {
            console.log('socket joined: ' + multicastGroup);
        }
    });
};

module.exports = socket;
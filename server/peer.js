var dgram = require('dgram');
var config = require('./config');

var socket = dgram.createSocket('udp4');

// bind the socket to an open port
socket.bind(config.multicastPort, function () {

    // config multicast
    socket.setMulticastTTL(128);

    // dont receive own sended messages
    socket.setMulticastLoopback(false);

    // join the group
    socket.addMembership(config.multicastGroup);

    if (config.debug) {
        console.log('socket joined: ' + config.multicastGroup);
    }
});

// error handler
socket.on('error', function (err)  {
    socket.close();
    if (config.debug) {
        console.log('socket error: ' + err);
    }
});

// close handler
socket.on('close', function ()  {
    if (config.debug) {
        console.log('socket closed');
    }
});

// listening handler
socket.on('listening', function () {
    if (config.debug) {
        var address = socket.address();
        console.log('listening at: ' + address.address + ':' + address.port);
    }
});

/**
 * Send a message to the group
 * @param type
 * @param message
 * @param callback
 */
socket.emit = function (type, message, callback) {

    // transform the object in a string to send through the wire
    var str = JSON.stringify({
        type: type,
        message: message
    });

    // create a buffer object from the string
    var buffer = Buffer.from(str);

    socket.send(buffer, config.multicastPort, config.multicastGroup, function (err) {
        if (typeof callback == 'function') {
            callback(err);
        }
    });
};

module.exports = socket;
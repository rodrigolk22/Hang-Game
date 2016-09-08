var dgram = require('dgram');
var config = require('./config');
var events = require('events');

var socket = dgram.createSocket('udp4');

// bind the socket to an open port
socket.bind(config.multicastPort, function () {

    // config multicast
    socket.setMulticastTTL(128);

    // dont receive own sended messages
    //socket.setMulticastLoopback(false);

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

    // emit a custon 'connection' event
    socket.emit('connection', socket);

    if (config.debug) {
        var address = socket.address();
        console.log('listening at: ' + address.address + ':' + address.port);
    }
});

/**
 * Emit a message to the group
 * @param type
 * @param message
 * @param callback
 */
var emit = function (type, message, callback) {

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

/**
 * Messages handler that emits a custom event depending on message content
 */
socket.on('message', function (msg, remoteInfo) {

    // transform the message string into an object
    var obj = JSON.parse(msg);

    // emit the custom event
    socket.emit(obj.type, obj.message);
});

module.exports = {
    socket: socket,
    emit: emit
};
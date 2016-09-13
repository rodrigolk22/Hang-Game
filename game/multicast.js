var dgram = require('dgram');
var config = require('./../config');

/**
 * An multicast socket
 */
var socket = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true
});

/**
 * Store a reference to the last message sent
 * @type {null}
 */
var lastMessageSent = null;

/**
 * Set the message as the last message sent
 * @param message
 */
var setLastMessageSent = function (message) {
    lastMessageSent = message;
};

/**
 * Compare an message to the last message sent
 * @param message
 * @returns {boolean}
 */
var hasDiffFromLastMessageSent = function (message) {
    return lastMessageSent == message;
};

// bind the multicast socket to an defined port
socket.bind(config.multicastPort, function () {

    // config multicast
    socket.setMulticastTTL(config.multicastTTL);

    // could receive own messages?
    socket.setMulticastLoopback(config.multicastLoopback);

    // join the group
    socket.addMembership(config.multicastGroup);

    if (config.debug) {
        var address = socket.address();
        console.log('listening at: ' + address.address + ':' + address.port);
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

/**
 * Emit a message to the group
 * @param event
 * @param data
 * @param callback
 */
var emit = function (event, data, callback) {

    // Object to be sent
    var obj = {
        pid: process.pid, // required to run multiple games on same machine
        event: event,
        data: data
    };

    // transform the object in a string to send through the wire
    var message = JSON.stringify(obj);

    // set this message as the lastMessageSent
    setLastMessageSent(message);


    // TODO: encrypt the message emitted here!


    // create a buffer object from the string
    var buffer = Buffer.from(message);

    // send the buffer to the group at the specified port
    socket.send(buffer, 0, buffer.length, config.multicastPort, config.multicastGroup, function (err) {
        if (typeof callback == 'function') {
            callback(err);
        }
    });
};

/**
 * Handle a message received from the group
 * @param buffer the message received
 * @param remote remote address information
 */
socket.on('message', function (buffer, remote) {

    // TODO: decrypt the message received here!

    var message = buffer.toString();

    // transform the message string into an object
    var obj = JSON.parse(message);

    // discard the message if it was sent by this process
    if (hasDiffFromLastMessageSent(message)) {
        if (config.debug) {
            console.log('discarded message', obj.event, 'from', remote.address + ':' + remote.port + '@' + obj.pid);
        }
        return;
    }

    if (config.debug) {
        console.log('received an', obj.event, 'from', remote.address + ':' + remote.port + '@' + obj.pid);
    }

    // emit the custom event
    socket.emit(obj.event, obj.data);
});

module.exports = {
    socket: socket,
    emit: emit
};
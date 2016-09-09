var dgram = require('dgram');
var config = require('./config');

// UDP socket using IPV4 protocol
var socket = dgram.createSocket('udp4');

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

    // transform the object in a string to send through the wire
    var str = JSON.stringify({
        event: event,
        data: data
    });

    // TODO: encrypt the message received here!

    // create a buffer object from the string
    var buffer = Buffer.from(str);

    // send the buffer to the group at the specified port
    socket.send(buffer, config.multicastPort, config.multicastGroup, function (err) {
        if (typeof callback == 'function') {
            callback(err);
        }
    });
};

/**
 * Handle a message received from the group
 * @param buffer the message received
 * @param remoteInfo remote address information
 */
var receive = function (buffer, remoteInfo) {

    // TODO: decrypt the message received here!

    // transform the message string into an object
    var obj = JSON.parse(buffer.toString());

    if (config.debug) {
        console.log('received an', obj.event, 'from', remoteInfo, 'with', obj.data);
    }

    // emit the custom event
    socket.emit(obj.event, obj.data);
};

// Messages handler
socket.on('message', receive);

module.exports = {
    socket: socket,
    emit: emit
};
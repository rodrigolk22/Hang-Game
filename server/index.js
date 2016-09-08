var peer = require('./peer');
var prompt = require('prompt');
var open = require('open');

prompt.start();

prompt.get(['username', 'port', 'group'], function (err, res) {
    if (err) throw err;

    console.log('Hello ' + res.username + '!');

    // start the peer (bind the socket, join the group and open the browser)
    peer.start(res.port, res.group);

    const message = Buffer.from(res.username + ' joined the game!');
    peer.sendObject(message, 6789, function (err) {
        if (err) throw err;

        // do something
    });

    // open the browser to show the client interface
    open('http://localhost:8080');
});
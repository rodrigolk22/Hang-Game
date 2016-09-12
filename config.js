module.exports = {
    window: {
        width: 1024,
        height: 768,
        frame: true
    },
    serverPort: 8082,  // port for browser communication
    multicastPort: 6789,
    multicastGroup: '228.5.6.7',
    multicastTTL: 128,
    multicastLoopback: true, // return messages to sender interface
    debug: true,

    minPlayers: 2, // minimum number of players
};
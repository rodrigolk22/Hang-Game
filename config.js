module.exports = {
    window: {
        width: 800,
        height: 600,
        frame: true
    },
    serverPort: 8081, // port for browser communication
    multicastPort: 6789,
    multicastGroup: '228.5.6.7',
    multicastTTL: 128,
    multicastLoopback: true, // return messages to sender interface
    debug: true
};
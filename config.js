module.exports = {
    window: {
        width: 1024,
        height: 768,
        frame: true
    },
    serverPort: 8083,  // port for browser communication
    multicastPort: 6789,
    multicastGroup: '228.5.6.7',
    multicastTTL: 128,
    multicastLoopback: true, // return messages to sender interface
    debug: true,

    minPlayers: 2, // minimum number of players
    syncTime: 1000, // maximum time to wait for the first sync
    waitingPlayersTime: 20000,
    waitingChoiceTime: 8000,
    waitingGuessTime: 15000,
    announcingWinnerTime: 5000
};
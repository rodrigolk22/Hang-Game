module.exports = {
    window: {
        width: 500,
        height: 600,
        frame: true
    },
    serverPort: 8081,  // port for browser communication
    multicastPort: 6789,
    multicastGroup: '228.5.6.7',
    multicastTTL: 128,
    multicastLoopback: true, // return messages to sender interface
    debug: true,

    minPlayers: 3, // minimum number of players
    syncTime: 2000, // maximum time to wait for the first sync
    waitingPlayersTime: 25000,
    waitingChoiceTime: 8000,
    waitingGuessTime: 15000,
    announcingWinnerTime: 5000,

    maxPlayerFaults: 3 // max timeouts for an peer
};
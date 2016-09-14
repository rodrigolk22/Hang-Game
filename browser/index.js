var  electron = require('electron'),
    config = require('./../config');

// store the server port in a global to be used in index.html
global.sharedObject = {
    port: process.argv[2]
};

var app = electron.app,
    BrowserWindow = electron.BrowserWindow;

// Start the desktop app
app.on('ready', function () {

    var window = new BrowserWindow({
        width: config.window.width,
        height: config.window.height,
        frame: config.window.frame
    });

    window.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    window.on('closed', function () {
        window = null;
    });
});
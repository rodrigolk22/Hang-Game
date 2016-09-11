var exec = require('child_process').exec,
    config = require('./config');

// starts the game
require('./game');

// open the headless browser with electron
exec('electron ./browser', function(err, stdout, stderr) {
    if (err) throw err;
});
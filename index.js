var exec = require('child_process').exec,
    prompt = require('prompt'),
    colors = require('colors/safe'),
    config = require('./config');

prompt.start();

// get the nickname from terminal
prompt.get({
    properties: {
        nickname: {
            description: colors.magenta("What is your name?")
        }
    }
}, function (err, result) {

    // starts the game
    require('./game')(result.nickname);

    // open the headless browser with electron
    exec('electron ./browser', function(err, stdout, stderr) {
        if (err) throw err;
    });

});
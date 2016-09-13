'use strict';

var exec = require('child_process').exec,
    fs = require('fs');

/**
 * Generate a public and a private key and store on /certs
 * @param name name of the generated certs
 */
var generate = function (name, callback) {

    var publicCertPath = './certs/client/' + name + '.pub';
    var privateCertPath = './certs/server/' + name + '.key.pem';

    // generate the private key
    exec('openssl genrsa -out ' + privateCertPath + ' 2048', function(err, stdout, stderr) {
        if (err) throw err;

        // generate the public key
        exec('openssl rsa -in ' + privateCertPath + ' -pubout -out ' + publicCertPath, function(err, stdout, stderr) {
            if (err) throw err;

            // set the private and public key
            var privateKey = fs.readFileSync('./certs/server/' + name + '.key.pem').toString();
            var publicKey = fs.readFileSync('./certs/client/' + name + '.pub').toString();

            // continue to the callback
            callback(privateKey, publicKey);
        });
    });
};

module.exports =  {
    generate: generate
};
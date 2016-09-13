var ursa = require('ursa');

/**
 * Encrypt the message with an private key
 * @param message
 * @param key
 * @returns {*}
 */
var encryptWithPrivateKey = function (message, key) {
    if (typeof message == 'object')
        message = JSON.stringify(message);

    key = Buffer.from(key);

    return ursa.createPrivateKey(key).privateEncrypt(message, 'utf8', 'base64');
};

/**
 * Decrypt the message with an public key
 * @param message
 * @param key
 */
var decryptWithPublicKey = function (message, key) {
    key = Buffer.from(key);
    message = ursa.createPublicKey(key).publicDecrypt(message, 'base64', 'utf8');
    return JSON.parse(message);
};

module.exports = {
    encryptWithPrivateKey: encryptWithPrivateKey,
    decryptWithPublicKey: decryptWithPublicKey
};
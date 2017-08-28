var crypto = require('crypto');

/**
 * Encrypt data.
 * @param {string} algorithm
 * The algorithm to encrypt data. Using crypto.getCiphers() can list all of the algorithms.
 * @param {string} key
 * The key to encrypt (or decrypt) data.
 * @param {string} data
 * The data which you want to encrypt.
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>encrypted (string): encrypted data</li>
 * </ul>
 */
exports.cipher = function(algorithm, key, data, callback) {
    var encrypted = "";
    var cip = crypto.createCipher(algorithm, key);
    encrypted += cip.update(data, 'binary', 'hex');
    encrypted += cip.final('hex');
    callback(encrypted);
}

/**
 * Decrypt data.
 * @param {string} algorithm
 * The algorithm to decrypt data. Using crypto.getCiphers() can list all of the algorithms.
 * @param {string} key
 * The key to encrypt (or decrypt) data.
 * @param {string} encrypted
 * The data which you want to decrypt.
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>decrypted (string): decrypted data</li>
 * </ul>
 */
exports.decipher = function(algorithm, key, encrypted, callback) {
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    callback(decrypted);
}
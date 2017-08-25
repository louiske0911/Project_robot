/**
 * @fileoverview Create Jenkins credentials for accessing repositories
 */

/**
 * @classdesc Factory class for creating credentials used by Jenkins jobs
 * @constructor
 */
function JenkinsCredentialFactory() {
}


/**
 * Enum for credential types
 * @readonly
 * @enum {number}
 */
JenkinsCredentialFactory.TYPE = {
    /** tyipical username with password */
    USER_PASS: 1,
    /** SSH username & private key */
    SSH_USER_PRIVATE_KEY: 2
};


/**
 * Create a credential with username & password
 * @static
 * @param {string} username username
 * @param {string} password password
 * @returns {Object} credential
 */
JenkinsCredentialFactory.createUserPass = function(username, password) {
    var credential = {
        type: JenkinsCredentialFactory.TYPE.USER_PASS,
        username: username,
        password: password
    };

    return credential;
};


/**
 * Create an SSH credential with username & private key
 * @static
 * @param {string} username username
 * @param {string} privateKey private key
 * @param {string} passPhrase pass phrase
 * @returns {Object} credential
 */
JenkinsCredentialFactory.createSSHUserKey = function(username, privateKey, passPhrase) {
    var credential = {
        type: JenkinsCredentialFactory.TYPE.SSH_USER_PRIVATE_KEY,
        username: username,
        privateKey: privateKey,
        passPhrase: passPhrase
    };

    return credential;
};

module.exports.JenkinsCredentialFactory = JenkinsCredentialFactory;

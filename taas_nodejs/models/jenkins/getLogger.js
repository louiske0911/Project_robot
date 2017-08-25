/**
 * @fileoverview set up logging service for Jenkins
 */
var conf = require('../../lib/config');
const enableUnitTest = conf.get('unit_test');
const enableLoggingLib = true;

if (enableUnitTest) {
    var logger = {
        debug: function(a1) { },
        info: function(a1) { },
        warn: function(a1) { },
        error: function(a1) { },
        critical: function(a1) { }
    };
}
/* istanbul ignore next */
else if (enableLoggingLib) {
    var logger = require('../../lib/logging').log_routes('Jenkins');
    logger.setLevel('all');  //set logger level
}
/* istanbul ignore else */
else {
    var logger = {
        debug: function(a1) {console.log(a1);},
        info: function(a1) {console.log(a1);},
        warn: function(a1) {console.log(a1);},
        error: function(a1) {console.error(a1);},
        critical: function(a1) {console.error(a1);}
    };
}


exports.logger = logger;


function ULAInit(logConfigFile) {
    var log4js = require('log4js');
    var fs = require('fs');

    var logConfig = JSON.parse(fs.readFileSync(logConfigFile, 'utf8'));
    var processID = process.pid;
    var item = {type: 'pattern', pattern:'%d{MM dd hh:mm:ss yyyy} ' + processID + ' %c %-5p: %m '};
    for ( i=0; i<Object.keys(logConfig.appenders).length; i++){
        // logConfig['appenders'][i].layout = item;
        logConfig.appenders[i].layout = item;
    }
    log4js.configure(logConfig);

    return log4js;
}


var path = require('path');
var log4js = ULAInit(path.join(__dirname, '../logfile.json'));
module.exports = {
    log_routes : function (name){
        logger2 = log4js.getLogger(name); // get Category 
        return logger2;
    },

    loggdb : function (name){
        logger = log4js.getLogger(name);
        return logger;
    }
};

/**
 * @fileoverview Archived file listing service
 */

var execFile = require('child_process').execFile;
var http = require('http');
var url = require('url');
var ARCHIVE_ROOT = '/archive_root';
var PORT = 8501;


function filterFile(filePath) {
    return filePath;
}


function listFiles(searchDirectory, callback) {
    execFile('find', [searchDirectory, '-type', 'f', '-printf', '%P\\n'], function(err, stdout, stderr) {
        if (err) {
            return callback(err);
        }
        var fileList = stdout.toString().split('\n').filter(filterFile);
        fileList.sort();
        return callback(err, fileList);
    });
}


/**
 * RESTtful API: /listFiles/<jobName/<runNumber/
 */
function handleGet(req, res) {
    var urlData = url.parse(req.url, true);
    var action = urlData.pathname
    if (action.startsWith('/listFiles/')) {
        var parms = action.split('/').filter(function(val) {return val;});
        if (parms.length != 3) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            return res.end('Bad request');
        }
        var jobName = parms[1];
        var runNumber = parms[2];
        listFiles(ARCHIVE_ROOT + '/' + jobName + '/' + runNumber + '/', function(err, fileList) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                return res.end('Internal server error');
            }
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify(fileList));
        });
    }
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        return res.end('Not found');
    }
}


var server = http.createServer(handleGet);
server.listen(PORT);
console.log('Archive file listing server listens at port ' + PORT);

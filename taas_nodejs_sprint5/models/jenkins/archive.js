/**
 * @fileoverview Jenkins file archive
 */
var http = require('http');
var bufferWriter = require('../../lib/bufferWriter');
var logger = require('./getLogger').logger;

var conf = require('../../lib/config');
var ARCHIVE_FILE_SERVER = conf.get('archive_file_server');
var ARCHIVE_FILE_LISTING_SERVER = conf.get('archive_file_listing_server');


/**
 * Fetch a file content from the archive server
 * @param {string} jobName job name
 * @param {number} buildNumber build number
 * @param {string} filePath the relative path to the target file
 * @param {fn} callback receives results. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>buffer: buffer to the file contents; may contain textual or binary data</li>
 *   </ul>
 */
function getFile(jobName, buildNumber, filePath, callback) {

    function onError(err) {
        var errName = 'archive getFile';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.warn(err.toString());
        return callback(err);
    }

    var url = ARCHIVE_FILE_SERVER + '/' + jobName + '/' + buildNumber + '/' + filePath;
    logger.debug('archive getFile: ' + 'url=' + url);
    var req = http.get(url, function(res) {
        var bw = new bufferWriter.BufferWriter();
        res.pipe(bw);
        bw.on('finish', function() {
            if (res.statusCode != 200) {
                return onError(new Error('Invalid http response code: ' + res.statusCode));
            }
            return callback(null, bw.getBuffer());
        });
        bw.on('error', function(err) {
            return onError(err);
        });
    });
    req.on('error', function(err) {
        return onError(err);
    });
}


/**
 * Get the file list from the archive server
 * @param {string} jobName job name
 * @param {number} buildNumber build number
 * @param {fn} callback receives results. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>fileList: the file path list</li>
 *   </ul>
 */
function getFileList(jobName, buildNumber, callback) {

    function onError(err) {
        var errName = 'archive getFilelist';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.warn(err.toString());
        return callback(err);
    }

    var url = ARCHIVE_FILE_LISTING_SERVER + '/listFiles/' + jobName + '/' + buildNumber;
    logger.debug('archive getFileList: ' + 'url=' + url);
    var req = http.get(url, function(res) {
        var bw = new bufferWriter.BufferWriter();
        res.pipe(bw);
        bw.on('finish', function() {
            try {
                if (res.statusCode != 200) {
                    throw new Error('Invalid http response code: ' + res.statusCode);
                }
                var fileList = JSON.parse(bw.getBuffer().toString());
                if (!Array.isArray(fileList)) {
                    throw new Error('Not an array: ' + fileList);
                }
                return callback(null, fileList);
            } catch (err) {
                return onError(err);
            }
        });
        bw.on('error', function(err) {
            return onError(err);
        });
    });
    req.on('error', function(err) {
        return onError(err);
    });
}


function callbackPrint(err, buf) {
    if (err) {
        return console.error(err);
    }
    console.log('buf=', buf);
    var b = new Buffer(buf);
    console.log(b.toString());
}


module.exports.getFile = getFile;
module.exports.getFileList = getFileList;
module.exports.callbackPrint = callbackPrint;

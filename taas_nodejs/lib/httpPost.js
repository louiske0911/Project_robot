/**
 * @fileoverview Http poster
 */
var querystring = require('querystring');
var http = require('http');
var bufferWriter = require('./bufferWriter');


exports.postTextData = function(host, port, path, data, callback) {
    
    function onError(err) {
        var errName = 'postTextData';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        return callback(err);
    }

    data = querystring.stringify(data);

    var options = {
        host: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');

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
        return callback(err);
    });

    req.write(data);
    req.end();
};

/**
 * @fileoverview Readable stream to buffer converter
 */
var stream = require('stream');
var util = require('util');


function BufferWriter() {
    // init super
    stream.Writable.call(this);

    this._bufs = [];
}

util.inherits(BufferWriter, stream.Writable);


BufferWriter.prototype._write = function(chunk, enc, callback) {
    var newBuf = (Buffer.isBuffer(chunk))? chunk: new Buffer(chunk, enc);
    this._bufs.push(newBuf);
    callback();
};


BufferWriter.prototype.getBuffer = function() {
    var buffer = Buffer.concat(this._bufs);
    return buffer;
};


exports.BufferWriter = BufferWriter;

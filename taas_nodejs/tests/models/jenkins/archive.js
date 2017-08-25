require('mocha');
var nock = require('nock');
var assert = require('assert');
var util = require('util');
var conf = require('../../../lib/config');
var archive = require('../../../models/jenkins/archive');

suite('models/jenkins/archive', function() {

    var ARCHIVE_FILE_SERVER = conf.get('archive_file_server');
    var ARCHIVE_FILE_LISTING_SERVER = conf.get('archive_file_listing_server');

    teardown(function() {
        nock.cleanAll();
        nock.enableNetConnect();
    });
    
    test('getFile: retrieve an existing file', function(done) {
        var jobName = 'proj1';
        var buildNumber = 100;
        var fileName = 'file.txt';

        var fileContents = 'Hello world!\nabcde\n中文測試';
        nock(ARCHIVE_FILE_SERVER)
        .get(util.format('/%s/%d/%s', jobName, buildNumber, fileName))
        .reply(200, fileContents);

        archive.getFile(jobName, buildNumber, fileName, function(err, buffer) {
            assert(!err);
            assert.equal(buffer.toString(), fileContents);
            done();
        });
    });

    test('getFile: retrieve a non-existing file', function(done) {
        var jobName = 'proj1';
        var buildNumber = 100;
        var fileName = 'file.txt';

        var fileContents = 'Hello world!\nabcde\n中文測試';
        nock(ARCHIVE_FILE_SERVER)
        .get(util.format('/%s/%d/%s', jobName, buildNumber, fileName))
        .reply(500, fileContents);

        archive.getFile(jobName, buildNumber, fileName, function(err, buffer) {
            assert(err);
            done();
        });
    });

    test('getFile: no network connection', function(done) {
        var jobName = 'proj1';
        var buildNumber = 100;
        var fileName = 'file.txt';

        nock.disableNetConnect();

        archive.getFile(jobName, buildNumber, fileName, function(err, buffer) {
            assert(err);
            done();
        });
    });

    test('getFileList: normal case', function(done) {
        var jobName = 'proj1';
        var buildNumber = 100;

        var replyContents = ['file1.html', 'file2.html'];
        nock(ARCHIVE_FILE_LISTING_SERVER)
        .get(util.format('/listFiles/%s/%d', jobName, buildNumber))
        .reply(200, replyContents);

        archive.getFileList(jobName, buildNumber, function(err, fileList) {
            assert(!err);
            assert.deepEqual(fileList, replyContents);
            done();
        });
    });

    test('getFileList: non-existing jobName/buildNumber', function(done) {
        var jobName = 'proj1';
        var buildNumber = 100;

        var replyContents = ['file1.html', 'file2.html'];
        nock(ARCHIVE_FILE_LISTING_SERVER)
        .get(util.format('/listFiles/%s/%d', jobName, buildNumber))
        .reply(500, replyContents);

        archive.getFileList(jobName, buildNumber, function(err, fileList) {
            assert(err);
            done();
        });
    });

    test('getFileList: no network connection', function(done) {
        var jobName = 'proj1';
        var buildNumber = 100;

        nock.disableNetConnect();

        archive.getFileList(jobName, buildNumber, function(err, fileList) {
            assert(err);
            done();
        });
    });
});

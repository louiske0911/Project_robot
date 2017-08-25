/**
 * @fileoverview test /lib/logging.js
 * @author itri453740@itri.org.tw (DaJen)
 */ 
/* 
 * 2016/7/14 (DaJen)
 *   1. add test module.log_routes()
 *   2. add test module.loggdb()
 */
var fs = require('fs');
var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var fakeLog4js = require('log4js');
var logging = proxyquire('../../lib/logging.js',{
	'log4js' : fakeLog4js
});

/**
 * for test lib/logging.js
 */
suite('lib/logging.js',function(){
	/**
	 * write fake /log/Routes/Routes_log.log and check file write success
	 */
	test('log_routes: normal case',function(done){
		var testName='Routes';
		fakeLog4js.configure('tests/logfile.json');
		var logTest = logging.log_routes(testName);
		logTest.setLevel('all');
		logTest.debug('Unit Test tests/lib/logging.js function log_routes' );

		fs.readFile('tests/log/Routes/'+testName+'_log.log',function(error, content){
		    if(error){
		        assert.isNotOk(error,error);
		        done();
		    }
		    else {
		        var splitted = content.toString().split("\n");
		        assert.equal(splitted[splitted.length-2].substring(26),'[DEBUG] Routes - Unit Test tests/lib/logging.js function log_routes','wrong function log_routes');
		        done();
		    }
		});
	});

	/**
	 * write fake /log/Routes/Routes_log.log and check file write success
	 */
	test('loggdb: normal case',function(done){
		var testName='Routes';
		fakeLog4js.configure('tests/logfile.json');
		var logTest = logging.loggdb(testName);
		logTest.setLevel('all');
		logTest.debug('Unit Test tests/lib/logging.js function loggdb');

		fs.readFile('tests/log/Routes/'+testName+'_log.log',function(error, content){
		    if(error){
		        assert.isNotOk(error,error);
		        done();
		    }
		    else {
		        var splitted = content.toString().split("\n");
		        assert.equal(splitted[splitted.length-2].substring(26),'[DEBUG] Routes - Unit Test tests/lib/logging.js function loggdb','wrong function loggdb');
		        done();
		    }
		});
	});
});
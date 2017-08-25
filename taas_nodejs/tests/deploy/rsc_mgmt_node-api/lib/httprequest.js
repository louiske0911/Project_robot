var sinon = require('sinon');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var fakelog4js = {};
fakelog4js.getLogger = sinon.stub();
fakelog4js.getLogger.returns(fakelog4js);
fakelog4js.info = sinon.spy();
fakelog4js.error = sinon.spy();
var nock = require('nock');

var httprequest = proxyquire('../../../../deploy/rsc_mgmt_node-api/lib/httprequest.js',
	{
		"log4js" : fakelog4js
	}
);

suite('deploy/rsc_mgmt_node-api/lib/httprequest.js', function(){
	test('httprequest: 200 OK case', function(done){
		nock('http://www.pagenotexist.com').get('/whatever').reply(200, 'return_value');
		var api = "http://www.pagenotexist.com/whatever";
		httprequest("GET", null, null, api, function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data.body, 'return_value');
			done();
		});
	});

	test('httprequest: 404 Not Found case', function(done){
		nock('http://www.pagenotexist.com').get('/whatever').reply(404);
		var api = "http://www.pagenotexist.com/whatever";
		httprequest("GET", null, null, api, function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.isNotOk(data, 'It needs to be undefined');
			done();
		});
	});


});
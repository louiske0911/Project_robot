var sinon = require('sinon');
var assert = require('chai').assert;
var fakehttprequest = sinon.stub();
var fakeconfig = {};
var proxyquire = require('proxyquire');
var fakelog4js = {configure :sinon.stub(),getLogger:sinon.stub()};
fakelog4js.getLogger.returns({info:sinon.stub()});
global.auth;
var Auth = proxyquire('../../../../deploy/rsc_mgmt_node-api/lib/auth.js',
	{
		"./config.js" : fakeconfig,
		"./httprequest.js" : fakehttprequest,
		"log4js" : fakelog4js
	}
);

suite('rsc_mgmt_node-api/lib/auth.js', function() {
	test('getToken: normal case', function(done){
		auth =new Auth();
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('username').returns('fakeusername');
		fakeconfig.get.withArgs('password').returns('fakepassword');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"token":{"issued_at": "fakeissuedat","expires_at":"fakeexpiresat"}})
		fakehttprequest.callsArgWith(4, null, {"body": fakeBody,"headers":{"x-subject-token":"fakeToken"}});
		auth.getToken(function(err,token){
			assert.equal('fakeToken', token, 'It should return fakeToken');
			done();
		});
	});

	test('getToken: token exist and not expired', function(done){
		auth =new Auth();
		auth._token = "fakeToken";
		auth.getToken(function(err,token){
			assert.equal('fakeToken', token, 'It should return fakeToken');
			done();
		});
	});

	test('getToken: connect openstack failed case', function(done){
		auth =new Auth();
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('username').returns('fakeusername');
		fakeconfig.get.withArgs('password').returns('fakepassword');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, new Error('some error happened'));
		auth.getToken(function(err,token){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getToken: openstack return incomplete json case', function(done){
		auth =new Auth();
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('username').returns('fakeusername');
		fakeconfig.get.withArgs('password').returns('fakepassword');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"token":{"issued_at": "fakeissuedat"}})
		fakehttprequest.callsArgWith(4, null, {"body": fakeBody,"headers":{"x-subject-token":"fakeToken"}});
		auth.getToken(function(err,token){
			assert.equal('creating token failed', err.message, 'It should pass error to first arg');
			done();
		});
	});

});

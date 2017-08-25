var sinon = require('sinon');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var PassThrough = require('stream').PassThrough;
var fakehttprequest = sinon.stub();
var fakesession = {};
var fakeconfig = {};

var resourseManagement = proxyquire('../../../routes/TestTask/resourceManagement.js',
	{
		"../../lib/session.js" : fakesession,
		"../../lib/httprequest.js" : fakehttprequest,
		"../../lib/config.js" : fakeconfig
	}
);

fakeconfig.get = sinon.stub();
fakeconfig.get.withArgs('resource_management_server').returns('http://fakeresourcemanagementserverurl');

suite('routes/TestTask/resourseManagement.js', function(){
	test('getStackInfo: normal case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(true);
		var request = new PassThrough();
		request.body = {projID: 'fakejobname'};
		var response = new PassThrough();
        response.json = function(jsonObj) {  // express 3.x response has a json method
            response.write(JSON.stringify(jsonObj));
        };
		response.set = sinon.spy();
		fakestackinfo = [
			{
				vm_spec_name: 'main',
				stack_status: 'CREATE_COMPLETE'
			}
		];
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body: JSON.stringify(fakestackinfo)});
		resourseManagement.getStackInfo(request, response);
		assert.equal("http://fakeresourcemanagementserverurl/taas/getDeployTaskStackInfo/fakejobname", fakehttprequest.getCall(0).args[3]);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal(JSON.stringify(fakestackinfo), responsetext);
			done();
		});
	});

	test('getStackInfo: not login case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(false);
		var request = new PassThrough();
		request.body = {jobname: 'fakejobname'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakestackinfo'});
		resourseManagement.getStackInfo(request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('verify error', responsetext);
			done();
		});
	});

	test('deleteInstance: normal case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(true);
		var request = new PassThrough();
		request.body = {instanceid: 'fakeid'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'success'});
		resourseManagement.deleteInstance(request, response);
		assert.equal("http://fakeresourcemanagementserverurl/nova/deleteInstanceByID/fakeid", fakehttprequest.getCall(0).args[3]);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('deleteInstance: not login case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(false);
		var request = new PassThrough();
		request.body = {instanceid: 'fakeid'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'success'});
		resourseManagement.deleteInstance(request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('verify error', responsetext);
			done();
		});
	});

	test('rebuildInstance: normal case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(true);
		var request = new PassThrough();
		request.body = {instanceid: 'fakeid'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'success'});
		resourseManagement.rebuildInstance(request, response);
		assert.equal("http://fakeresourcemanagementserverurl/nova/rebuildInstance/fakeid", fakehttprequest.getCall(0).args[3]);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rebuildInstance: not login case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(false);
		var request = new PassThrough();
		request.body = {instanceid: 'fakeid'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'success'});
		resourseManagement.rebuildInstance(request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('verify error', responsetext);
			done();
		});
	});

	test('rebootInstance: normal case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(true);
		var request = new PassThrough();
		request.body = {instanceid: 'fakeid'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'success'});
		resourseManagement.rebootInstance(request, response);
		assert.equal("http://fakeresourcemanagementserverurl/nova/rebootInstance/fakeid", fakehttprequest.getCall(0).args[3]);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rebootInstance: not login case', function(done){
		fakesession.checkLoginbySessBool = sinon.stub();
		fakesession.checkLoginbySessBool.returns(false);
		var request = new PassThrough();
		request.body = {instanceid: 'fakeid'};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'success'});
		resourseManagement.rebootInstance(request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('verify error', responsetext);
			done();
		});
	});

});

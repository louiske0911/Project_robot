var sinon = require('sinon');
var assert = require('chai').assert;
global.auth = {};
var fakehttprequest = sinon.stub();
var fakeconfig = {};
fakeconfig.get = sinon.stub();
fakeconfig.get.withArgs('glance').returns('fakeglanceurl/');
fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
var proxyquire = require('proxyquire');
var fakeexpress = {};
fakeexpress.Router = sinon.stub();
fakeexpress.Router.returns(fakeexpress.Router);
fakeexpress.Router.route = sinon.stub();
var fakeGetImageByID = {get:sinon.stub()};

fakeexpress.Router.route.withArgs('/getImageByID/:id').returns(fakeGetImageByID);

var PassThrough = require('stream').PassThrough;
var fakeunderscore = {};

var glance = proxyquire('../../../../deploy/rsc_mgmt_node-api/routes/glance.js',
	{
		"../lib/config.js" : fakeconfig,
		"../lib/httprequest.js" : fakehttprequest,
		"express" : fakeexpress
	}
);

suite('deploy/rsc_mgmt_node-api/routes/glance.js', function() {

	test('getImageByID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeimage'});
		glance.getImageByID('fakeid', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('fakeimage', data);
			assert.equal('fakeglanceurl/images/fakeid', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getImageByID: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeimage'});
		glance.getImageByID('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('getImageByID: not found case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, new Error('404 Not Found'));
		glance.getImageByID('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('404 Not Found', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest getImageByID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeimage'});
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetImageByID.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('fakeimage', responsetext);
			done();
		});
	});

	test('rest getImageByID: get token case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeimage'});
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetImageByID.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});
});
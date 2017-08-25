var sinon = require('sinon');
var assert = require('chai').assert;
global.auth = {};
var fakehttprequest = sinon.stub();
var fakeconfig = {};
fakeconfig.get = sinon.stub();
fakeconfig.get.withArgs('nova').returns('fakenovaurl/');
fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
var proxyquire = require('proxyquire');
var fakeexpress = {};
fakeexpress.Router = sinon.stub();
fakeexpress.Router.returns(fakeexpress.Router);
fakeexpress.Router.route = sinon.stub();
var fakeGetInstances = {get:sinon.stub()};
var fakeGetInstanceByID = {get:sinon.stub()};
var fakeGetInstanceByName = {get:sinon.stub()};
var fakeGetInstanceStatusByName = {get:sinon.stub()};
var fakeRebootInstance = {post:sinon.stub()};
var fakeRebuildInstance = {post:sinon.stub()};
var fakeRebuildInstanceByName = {post:sinon.stub()};
var fakeDeleteInstanceByID = {delete:sinon.stub()};
var fakeHardRebootInstance = {post:sinon.stub()};
fakeexpress.Router.route.withArgs('/getInstances').returns(fakeGetInstances);
fakeexpress.Router.route.withArgs('/getInstanceByID/:id').returns(fakeGetInstanceByID);
fakeexpress.Router.route.withArgs('/getInstanceByName/:name').returns(fakeGetInstanceByName);
fakeexpress.Router.route.withArgs('/getInstanceStatusByName/:name').returns(fakeGetInstanceStatusByName);
fakeexpress.Router.route.withArgs('/rebootInstance/:id').returns(fakeRebootInstance);
fakeexpress.Router.route.withArgs('/rebuildInstance/:id').returns(fakeRebuildInstance);
fakeexpress.Router.route.withArgs('/rebuildInstanceByName/:name').returns(fakeRebuildInstanceByName);
fakeexpress.Router.route.withArgs('/deleteInstanceByID/:id').returns(fakeDeleteInstanceByID);
fakeexpress.Router.route.withArgs('/hardRebootInstance/:id').returns(fakeHardRebootInstance);
var PassThrough = require('stream').PassThrough;
var fakeunderscore = {};

var nova = proxyquire('../../../../deploy/rsc_mgmt_node-api/routes/nova.js',
	{
		"../lib/config.js" : fakeconfig,
		"../lib/httprequest.js" : fakehttprequest,
		"express" : fakeexpress,
		"underscore" : fakeunderscore
	}
);

suite('deploy/rsc_mgmt_node-api/routes/nova.js', function() {
	test('rest getInstances: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstances'});
		var request = new PassThrough();
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstances.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('fakeinstances', responsetext);
			done();
		});
	});
	test('rest getInstances: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstances'});
		var request = new PassThrough();
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstances.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});
	test('getInstances: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstances'});
		nova.getInstances(function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('fakeinstances', data);
			assert.equal('fakenovaurl/faketenentid/servers/detail', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getInstances: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstances'});
		nova.getInstances(function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('getInstances: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, new Error('some error happened'));
		nova.getInstances(function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('getInstanceByID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstance'});
		nova.getInstanceByID('fakeinstanceid', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('fakeinstance', data);
			assert.equal('fakenovaurl/faketenentid/servers/fakeinstanceid', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getInstanceByID: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstance'});
		nova.getInstanceByID('fakeinstanceid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('getInstanceByID: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, new Error('some error happened'));
		nova.getInstanceByID('fakeinstanceid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest getInstanceByID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstance'});
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceByID.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('fakeinstance', responsetext);
			done();
		});
	});

	test('rest getInstanceByID: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstance'});
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceByID.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext, 'error message is wrong');
			done();
		});
	});

	test('getInstancesSimply: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'simplefakeinstances'});
		nova.getInstancesSimply(function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('simplefakeinstances', data);
			assert.equal('fakenovaurl/faketenentid/servers', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getInstancesSimply: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'simplefakeinstances'});
		nova.getInstancesSimply(function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('getInstancesSimply: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, new Error('some error happened'));
		nova.getInstancesSimply(function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('findInstanceIdByName: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		nova.findInstanceIdByName("fakename", function(err, id){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('fakeid', id);
			done();
		});
	});

	test('findInstanceIdByName: no instance match case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakeunderscore.find = sinon.stub();
		nova.findInstanceIdByName("fakename", function(err, id){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('can not find instance', err.message, 'error message is wrong');
			done();
		});
	});

	test('findInstanceIdByName: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakeunderscore.find = sinon.stub();
		nova.findInstanceIdByName("fakename", function(err, id){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest getInstanceByName: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":"instancedetail"}'});
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceByName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('"instancedetail"', responsetext);
			done();
		});
	});

	test('rest getInstanceByName: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":"instancedetail"}'});
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceByName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('rest getInstanceByName: no instance match case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":"instancedetail"}'});
		fakeunderscore.find = sinon.stub();
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceByName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('can not find instance', responsetext);
			done();
		});
	});

	test('rest getInstanceByName: ACTIVE case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"status":"ACTIVE"}}'});
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceStatusByName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('ACTIVE', responsetext);
			done();
		});
	});

	test('rest getInstanceByName: DELETING case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"status":"ACTIVE","OS-EXT-STS:task_state":"deleting"}}'});
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceStatusByName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('DELETING', responsetext);
			done();
		});
	});

	test('rest getInstanceByName: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simplefakeinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"status":"ACTIVE"}}'});
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetInstanceStatusByName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('rebootInstance: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		nova.rebootInstance('fakeid', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('success', data);
			assert.equal('fakenovaurl/faketenentid/servers/fakeid/action', fakehttprequest.getCall(0).args[3]);
			assert.equal('SOFT', fakehttprequest.getCall(0).args[1].reboot.type);
			done();
		});
	});

	test('rebootInstance: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		nova.rebootInstance('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('rebootInstance: conflict case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('409 Conflict'));
		nova.rebootInstance('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('409 Conflict', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest rebootInstance: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeRebootInstance.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rest rebootInstance: conflict case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('409 Conflict'));
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeRebootInstance.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('409 Conflict', responsetext);
			done();
		});
	});

	test('rebuildInstance: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(1).callsArgWith(4);
		nova.rebuildInstance('fakeid', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('success', data);
			assert.equal('fakenovaurl/faketenentid/servers/fakeid/action', fakehttprequest.getCall(1).args[3]);
			done();
		});
	});

	test('rebuildInstance: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(1).callsArgWith(4);
		nova.rebuildInstance('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('rebuildInstance: conflict case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(1).callsArgWith(4, new Error('409 Conflict'));
		nova.rebuildInstance('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('409 Conflict', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest rebuildInstance: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(1).callsArgWith(4);
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeRebuildInstance.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rest rebuildInstance: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(1).callsArgWith(4);
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeRebuildInstance.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('rebuildInstanceByName: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simpleinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(2).callsArgWith(4);
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		nova.rebuildInstanceByName('fakename', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('success', data);
			assert.equal('fakenovaurl/faketenentid/servers/fakeid/action', fakehttprequest.getCall(2).args[3]);
			done();
		});
	});

	test('rebuildInstanceByName: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simpleinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(2).callsArgWith(4);
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		nova.rebuildInstanceByName('fakename', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('rebuildInstanceByName: conflict case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simpleinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(2).callsArgWith(4, new Error('409 Conflict'));
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		nova.rebuildInstanceByName('fakename', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('409 Conflict', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest rebuildInstanceByName: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simpleinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(2).callsArgWith(4);
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeRebuildInstanceByName.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rest rebuildInstanceByName: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'"simpleinstances"'});
		fakehttprequest.onCall(1).callsArgWith(4, null, {body:'{"server":{"image":{"id":"fakeimageid"}}}'});
		fakehttprequest.onCall(2).callsArgWith(4);
		fakeunderscore.find = sinon.stub();
		fakeunderscore.find.returns({id: "fakeid"});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakename";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeRebuildInstanceByName.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('deleteInstanceByID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'success'});
		nova.deleteInstanceByID('fakeid', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('success', data);
			assert.equal('fakenovaurl/faketenentid/servers/fakeid', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('deleteInstanceByID: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'success'});
		nova.deleteInstanceByID('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('deleteInstanceByID: conflict case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('409 Conflict'));
		nova.deleteInstanceByID('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('409 Conflict', err.message, 'error message is wrong');
			done();
		});
	});


	test('rest deleteInstanceByID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'success'});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeDeleteInstanceByID.delete.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rest deleteInstanceByID: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {body:'success'});
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeDeleteInstanceByID.delete.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('hardRebootInstance: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		nova.hardRebootInstance('fakeid', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal('success', data);
			assert.equal('fakenovaurl/faketenentid/servers/fakeid/action', fakehttprequest.getCall(0).args[3]);
			assert.equal('HARD', fakehttprequest.getCall(0).args[1].reboot.type);
			done();
		});
	});

	test('hardRebootInstance: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		nova.hardRebootInstance('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('some error happened', err.message, 'error message is wrong');
			done();
		});
	});

	test('hardRebootInstance: conflict case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('409 Conflict'));
		nova.hardRebootInstance('fakeid', function(err, data){
			assert(err instanceof Error, 'It should be an Error object');
			assert.equal('409 Conflict', err.message, 'error message is wrong');
			done();
		});
	});

	test('rest hardRebootInstance: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeHardRebootInstance.post.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('success', responsetext);
			done();
		});
	});

	test('rest hardRebootInstance: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4);
		var request = new PassThrough();
		request.params = {};
		request.params.name = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeHardRebootInstance.post.getCall(0).args[0](request, response);
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
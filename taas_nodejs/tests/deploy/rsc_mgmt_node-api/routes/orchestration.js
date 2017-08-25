var sinon = require('sinon');
var assert = require('chai').assert;
global.auth = {};
var fakehttprequest = sinon.stub();
var fakeconfig = {};
var proxyquire = require('proxyquire');
var fakeexpress = {};
var fakeUnderscore = {};
fakeexpress.Router = sinon.stub();
fakeexpress.Router.returns(fakeexpress.Router);
fakeexpress.Router.route = sinon.stub();
var fakeCreateStack = {get:sinon.stub()};
var fakeUpdateStack = {get:sinon.stub()};
var fakeDeleteStack = {get:sinon.stub()};
var fakeGetStackByStackName = {get:sinon.stub()};
var fakeGetStackOutputByKey = {get:sinon.stub()};
var fakeGetStackStatus = {get:sinon.stub()};
var fakeGetStacksList = {get:sinon.stub()};
var fakeGetStackEventList = {get:sinon.stub()};
fakeexpress.Router.route.withArgs('/createStack/:name/:num_instances/:vm_spec_name').returns(fakeCreateStack);
fakeexpress.Router.route.withArgs('/updateStack/:name/:num_instances').returns(fakeUpdateStack);
fakeexpress.Router.route.withArgs('/deleteStack/:name').returns(fakeDeleteStack);
fakeexpress.Router.route.withArgs('/getStack/:stack_name').returns(fakeGetStackByStackName);
fakeexpress.Router.route.withArgs('/getStack/:name/output/:outputKey').returns(fakeGetStackOutputByKey);
fakeexpress.Router.route.withArgs('/getStack/:name/status').returns(fakeGetStackStatus);
fakeexpress.Router.route.withArgs('/getStacksList').returns(fakeGetStacksList);
fakeexpress.Router.route.withArgs('/getStackEventList/:stack_name/:stack_id').returns(fakeGetStackEventList);

var PassThrough = require('stream').PassThrough;
var orchestration = proxyquire('../../../../deploy/rsc_mgmt_node-api/routes/orchestration.js',
	{
		"../lib/config" : fakeconfig,
		"../lib/httprequest" : fakehttprequest,
		"express" : fakeexpress,
		"underscore" : fakeUnderscore
	}
);

suite('rsc_mgmt_node-api/routes/orchestration.js', function() {
	test('rest createStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, "fakeData");
		var request = {"params":{'name':"fakeStackName", 'vm_spec_name': "fakeVmSpecName", "num_instances": "fakeNumInstance"}};
		var response = {};
		response.send = sinon.spy();

		fakeCreateStack.get.getCall(0).args[0](request, response);
		assert(response.send.calledWith("create success"));
		done();
	});
	
	test('rest createStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeData'});
		var request = {"params":{'name':"fakeStackName"}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeCreateStack.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('createStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeData'});
		orchestration.createStack('fakeStackName', 'fakeVmSpecName', 'fakeInstanceAmount',function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, 'create success');
			assert.equal('POST', fakehttprequest.getCall(0).args[0]);
			assert.equal('fakeStackName', fakehttprequest.getCall(0).args[1].stack_name);
			assert.equal('fakeheaturl/faketenentid/stacks', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('createStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, null, {body:'fakeinstances'});
		orchestration.createStack("fakeStackName", 'fakeVmSpecName', 'fakeInstanceAmount',function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('createStack: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.callsArgWith(4, new Error('some error happened'));
		orchestration.createStack("fakeStackName", 'fakeVmSpecName', 'fakeInstanceAmount',function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('rest getStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body":"fakeBody"});
		var request = {"params":{'stack_name':"fakeStackName"}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetStackByStackName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('fakeBody', responsetext);
			done();
		});
	});

	test('rest getStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body":"fakeBody"});
		var request = {"params":{'stack_name':"fakeStackName"}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetStackByStackName.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('getStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body":"fakeBody"});
		orchestration.getStack("fakeStackName",function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, 'fakeBody');
			assert.equal('fakeheaturl/faketenentid/stacks/fakeStackName', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakenovaurl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body":"fakeBody"});
		orchestration.getStack("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStack: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('some error happened'));
		orchestration.getStack("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStack: connect openstack redirect failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, new Error('some error happened'));
		orchestration.getStack("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('rest deleteStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, "fakeData");
		var request = {"params":{'name':"fakeStackName"}};
		var response = {};
		response.send = sinon.spy();

		fakeDeleteStack.get.getCall(0).args[0](request, response);
		assert(response.send.calledWith("success"));
		done();
	});

	test('rest deleteStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, "fakeData");
		var request = {"params":{'name':"fakeStackName"}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeDeleteStack.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('deleteStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, "fakeData");
		orchestration.deleteStack('fakeStackName',function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, 'success');
			assert.equal('fakeheaturl/faketenentid/stacks/fakeStackName', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('deleteStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakenovaurl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body":"fakeBody"});
		orchestration.deleteStack("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('deleteStack: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('some error happened'));
		orchestration.deleteStack("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('deleteStack: connect openstack redirect failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, new Error('some error happened'));
		orchestration.deleteStack("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});
	
	test('rest getStackStatus: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		var request = {"params":{'name':"fakeStackName"}};
		var response = {};
		response.send = sinon.spy();

		fakeGetStackStatus.get.getCall(0).args[0](request, response);
		assert(response.send.calledWith("fakeStatus"));
		done();
	});

	test('rest getStackStatus: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		var request = {"params":{'name':"fakeStackName"}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetStackStatus.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('getStackStatus: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackStatus('fakeStackName',function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, 'fakeStatus');
			assert.equal('fakeheaturl/faketenentid/stacks/fakeStackName', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getStackStatus: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakenovaurl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackStatus("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStackStatus: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('some error happened'));
		orchestration.getStackStatus("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStackStatus: connect openstack redirect failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, new Error('some error happened'));
		orchestration.getStackStatus("fakeStackName",function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('rest getStackOutputKey: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"outputs":"fakeOutput"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		fakeUnderscore.find = sinon.stub();
		fakeUnderscore.find.withArgs('fakeOutput').returns({"output_value":"fakeOutputValue"});
		var request = {"params":{"name":"fakeStackName","outputKey":"fakeoutputKey"}};
		var response = {};
		response.send = sinon.spy();

		fakeGetStackOutputByKey.get.getCall(0).args[0](request, response);
		assert(response.send.calledWith("fakeOutputValue"));
		done();
	});

	test('rest getStackOutputKey: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		var request = {"params":{'name':"fakeStackName"}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeGetStackOutputByKey.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('some error happened', responsetext);
			done();
		});
	});

	test('getStackOutputKey: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"outputs":"fakeOutput"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		fakeUnderscore.find = sinon.stub();
		fakeUnderscore.find.withArgs('fakeOutput').returns({"output_value":"fakeOutputValue"});
		orchestration.getStackOutputKey('fakeStackName','fakeOutputKey',function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, 'fakeOutputValue');
			assert.equal('fakeheaturl/faketenentid/stacks/fakeStackName', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getStackOutputKey: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakenovaurl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackOutputKey('fakeStackName','fakeOutputKey',function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStackOutputKey: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('some error happened'));
		orchestration.getStackOutputKey('fakeStackName','fakeOutputKey',function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStackOutputKey: connect openstack redirect failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, new Error('some error happened'));
		orchestration.getStackOutputKey('fakeStackName','fakeOutputKey',function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('rest updateStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null,"fakeData");
		fakehttprequest.onCall(2).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(3).callsArgWith(4, null,"fakeData");
		fakeUnderscore.find = sinon.stub();
		fakeUnderscore.find.withArgs('fakeOutput').returns({"output_value":"fakeOutputValue"});
		var request = {"params":{"name":"fakeStackName", "num_instances": 3}};
		var response = {};
		response.send = sinon.spy();
		fakeUpdateStack.get.getCall(0).args[0](request, response);
		assert(response.send.calledWith("update success"));
		done();
	});

	test('rest updateStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('key_name').returns('faketenentid');
		fakeconfig.get.withArgs('image').returns('fakeImage');
		fakeconfig.get.withArgs('network_private').returns('fakeNetworkprivate');
		fakeconfig.get.withArgs('network_public').returns('fakeNetworkpublic');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, null,"fakeData");
		fakehttprequest.onCall(2).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(3).callsArgWith(4, null,"fakeData");
		var request = {"params":{"name":"fakeStackName", "num_instances": 3}};
		var response = new PassThrough();
		response.set = sinon.spy();
		fakeUpdateStack.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('update some error happened', responsetext);
			done();
		});
	});

	test('updateStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"outputs":"fakeOutput"}});
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		fakeUnderscore.find = sinon.stub();
		fakeUnderscore.find.withArgs('fakeOutput').returns({"output_value":"fakeOutputValue"});
		orchestration.updateStack('fakeStackName', 3,function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, 'update success');
			assert.equal('fakeheaturl/faketenentid/stacks/fakeStackName', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('updateStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakenovaurl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakeBody = JSON.stringify({"stack":{"stack_status": "fakeStatus"}})
		fakehttprequest.onCall(1).callsArgWith(4, null, {"body": fakeBody});
		orchestration.updateStack('fakeStackName', 3,function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('updateStack: connect openstack failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, new Error('some error happened'));
		orchestration.updateStack('fakeStackName', 3,function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('updateStack: connect openstack redirect failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakehttprequest.onCall(0).callsArgWith(4, null, {"headers":{"location": "fakeLocation"}});
		fakehttprequest.onCall(1).callsArgWith(4, new Error('some error happened'));
		orchestration.updateStack('fakeStackName', 3,function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error to first arg');
			done();
		});
	});

	test('getStackWithID: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"stack": "fakeStackContent"});
		fakehttprequest.onCall(0).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackWithID('fakeStackName', 'fakeStackID', function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(JSON.stringify(data), fakeBody);
			assert.equal('fakeheaturl/faketenentid/stacks/fakeStackName/fakeStackID', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getStackWithID: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"stack": "fakeStackContent"});
		fakehttprequest.onCall(0).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackWithID('fakeStackName', 'fakeStackID', function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error message to first arg');
			done();
		});
	});

	test('getStacksList: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"stack": "fakeStacksContent"});
		fakehttprequest.onCall(0).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStacksList(function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(JSON.stringify(data), fakeBody);
			assert.equal('fakeheaturl/faketenentid/stacks', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getStacksList: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"stack": "fakeStacksContent"});
		fakehttprequest.onCall(0).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStacksList(function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error message to first arg');
			done();
		});
	});

	test('rest updateStack: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakeBody = {"body":JSON.stringify({"stack": "fakeStacksContent"})};
		fakehttprequest.onCall(0).callsArgWith(4, null, fakeBody);
		var request = {};
		var response = {};
		response.json = sinon.spy();
		response.end = sinon.spy();
		fakeGetStacksList.get.getCall(0).args[0](request, response);
		assert(response.json.calledWith(JSON.parse(fakeBody.body)), "it doesn't return correct things");
		done();
	});

	test('rest updateStack: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakeBody = {"body":JSON.stringify({"stack": "fakeStacksContent"})};
		fakehttprequest.onCall(0).callsArgWith(4, null, fakeBody);
		var request = {};
		var response = {};
		response.json = sinon.spy();
		response.end = sinon.spy();
		fakeGetStacksList.get.getCall(0).args[0](request, response);
		assert(response.end.calledWith('some error happened'), "it should return error message");
		done();
	});

	test('getStackEventList: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"events": "fakeEvents"});
		fakehttprequest.onCall(0).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackEventList('fakestackname', 'fakestackid',function(err, data){
			assert.isNotOk(err, 'It needs to be undefined');
			assert.equal(data, fakeBody);
			assert.equal('fakeheaturl/faketenentid/stacks/fakestackname/fakestackid/events', fakehttprequest.getCall(0).args[3]);
			done();
		});
	});

	test('getStackEventList: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakeconfig.get.withArgs('username').returns('fakeUserName');
		fakeconfig.get.withArgs('password').returns('fakePassword');
		fakehttprequest.reset();
		fakeBody = JSON.stringify({"events": "fakeEvents"});
		fakehttprequest.onCall(0).callsArgWith(4, null, {"body": fakeBody});
		orchestration.getStackEventList('fakestackname', 'fakestackid',function(err, data){
			assert.equal('some error happened', err.message, 'It should pass error message to first arg');
			done();
		});
	});

	test('rest getStackEventList: normal case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, null, 'faketoken');
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakeBody = {"body":JSON.stringify({"events": "fakeEvents"})};
		fakehttprequest.onCall(0).callsArgWith(4, null, fakeBody);
		var request = {};
		request.params = {
			stack_name: 'fakestackname',
			stack_id: 'fakestackid'
		}
		var response = {};
		response.set = sinon.spy();
		response.json = sinon.spy();
		response.end = sinon.spy();
		fakeGetStackEventList.get.getCall(0).args[0](request, response);
		assert(response.end.calledWith(fakeBody.body), "it doesn't return correct things");
		done();
	});

	test('rest getStackEventList: get token failed case', function(done){
		auth.getToken = sinon.stub();
		auth.getToken.callsArgWith(0, new Error('some error happened'));
		fakeconfig.get = sinon.stub();
		fakeconfig.get.withArgs('heat').returns('fakeheaturl/');
		fakeconfig.get.withArgs('tenant_id').returns('faketenentid');
		fakehttprequest.reset();
		fakeBody = {"body":JSON.stringify({"events": "fakeEvents"})};
		fakehttprequest.onCall(0).callsArgWith(4, null, fakeBody);
		var request = {};
		request.params = {
			stack_name: 'fakestackname',
			stack_id: 'fakestackid'
		}
		var response = {};
		response.json = sinon.spy();
		response.end = sinon.spy();
		fakeGetStackEventList.get.getCall(0).args[0](request, response);
		assert(response.end.calledWith('some error happened'), "it should return error message");
		done();
	});
});
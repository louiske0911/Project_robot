var sinon = require('sinon');
var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var PassThrough = require('stream').PassThrough;
var fakeexpress = {};
fakeexpress.Router = sinon.stub();
fakeexpress.Router.returns(fakeexpress.Router);
fakeexpress.Router.route = sinon.stub();
var fakeGetDeployTaskStackInfo = {get:sinon.stub()};
fakeexpress.Router.route.withArgs('/getDeployTaskStackInfo/:projID').returns(fakeGetDeployTaskStackInfo);
var fakeheat = {};
var fakeglance = {};
var fakenova = {};
var fakeunderscore = {};

var taas = proxyquire('../../../../deploy/rsc_mgmt_node-api/routes/taas.js',
	{
		"express" : fakeexpress,
		"underscore" : fakeunderscore,
		"./orchestration" : fakeheat,
		"./nova" : fakenova,
		"./glance" : fakeglance,
	}
);

suite('deploy/rsc_mgmt_node-api/routes/taas.js', function(){

	test('rest getDeployTaskStackInfo: normal case', function(){
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		response.json = sinon.stub();
		fakeheat.getStacksList = sinon.stub();
		var fakestacks = {
			stacks:[
				{
					id : "fakestackid1",
					stack_name : "fakestackname1",
					stack_status : "CREATE_COMPLETE"
				},
				{
					id : "fakestackid2",
					stack_name : "TaaS_fakeprojid_stack2",
					stack_status : "CREATE_FAILED"
				},
				{
					id : "fakestackid3",
					stack_name : "TaaS_fakeprojid_stack3",
					stack_status : "CREATE_IN_PROGRESS"
				}
			]
		};
		var fakestack1 = {
			stack:{
				id : "fakestackid1",
				stack_name: "fakestackname1",
				stack_status : "CREATE_COMPLETE",
				parameters:{
					flavor: 'fakeflavor1',
					key_name: 'fakekeyname1' 
				},
				outputs: [
					{
						output_value: [
							'fakepublicip1'
						],
						output_key: 'floating_ip'
					},
					{
						output_value: 'fakevmspecname1',
						output_key: 'vm_spec_name'
					},
					{
						output_value: [
							'fakeprivateip1'
						],
						output_key: 'private_ip'
					},
					{
						output_value: [
							'fakeinstancename1'
						],
						output_key: 'server_name'
					}
				]
			}
		}
		var fakestack2 = {
			stack:{
				id : "fakestackid2",
				stack_name: "TaaS_fakeprojid_stack2",
				stack_status : "CREATE_FAILED",
				parameters:{
					flavor: 'fakeflavor2',
					key_name: 'fakekeyname2' 
				}
			}
		}
		var fakestack3 = {
			stack:{
				id : "fakestackid3",
				stack_name: "TaaS_fakeprojid_stack3",
				stack_status : "CREATE_IN_PROGRESS",
				parameters:{
					flavor: 'fakeflavor3',
					key_name: 'fakekeyname3' 
				}
			}
		}
		var fakeevents1 = JSON.stringify([
			{
				"resource_name": "fakestackname2",
				"resource_status": "CREATE_FAILED",
				"resource_status_reason": "Resource CREATE failed: InternalServerError: fake"
			},
			{
				"resource_name": "worker_auto_scaling_group",
				"resource_status": "CREATE_FAILED",
				"resource_status_reason": "InternalServerError: resources.worker_auto_scaling_group.resources.xwsvh4v4ayfu.resources.floating_ip: delete_port_precommit failed."
			}
		]);
		var fakeinstance1 = JSON.stringify({
			server: {
				id: "fakeinstanceid1",
				name: "fakeinstancename1",
				image: {
					id: "fakeimageid1"
				},
				status: "fakestatus1",
				created: "fakecreatedtime1"
			}
		});
		var fakeimage1 = JSON.stringify({name: "fakeimagename1"});
		fakeheat.getStacksList.callsArgWith(0, null, fakestacks);
		fakeheat.getStackWithID = sinon.stub();
		fakeheat.getStackWithID.withArgs("fakestackname1", "fakestackid1").callsArgWith(2, null, fakestack1);
		fakeheat.getStackWithID.withArgs("TaaS_fakeprojid_stack2", "fakestackid2").callsArgWith(2, null, fakestack2);
		fakeheat.getStackWithID.withArgs("TaaS_fakeprojid_stack3", "fakestackid3").callsArgWith(2, null, fakestack3);
		fakeheat.getStackEventList = sinon.stub();
		fakeheat.getStackEventList.withArgs("TaaS_fakeprojid_stack2", "fakestackid2").callsArgWith(2, null, fakeevents1);
		fakeunderscore.find = sinon.stub();
		fakeunderscore.filter = sinon.stub();
		fakeunderscore.filter.onCall(0).returns(fakestacks.stacks);
		fakeunderscore.filter.onCall(1).returns(JSON.parse(fakeevents1));
		fakenova.findInstanceIdByName = sinon.stub();
		fakenova.findInstanceIdByName.withArgs("fakeinstancename1").callsArgWith(1, null, "fakeinstanceid1");
		fakenova.getInstanceByID = sinon.stub();
		fakenova.getInstanceByID.withArgs("fakeinstanceid1").callsArgWith(1, null, fakeinstance1);
		fakeglance.getImageByID = sinon.stub();
		fakeglance.getImageByID.withArgs("fakeimageid1").callsArgWith(1, null, fakeimage1);
		fakeGetDeployTaskStackInfo.get.getCall(0).args[0](request, response);
		var success_data = [
			{
				vm_spec_name: 'fakevmspecname1',
				stack_status: 'CREATE_COMPLETE',
				public_ips: [ 'fakepublicip1' ],
				private_ips: [ 'fakeprivateip1' ],
				instance_name: [ 'fakeinstancename1' ],
				flavor: 'fakeflavor1',
				keypair: 'fakekeyname1',
				instances: [
					{
						id: 'fakeinstanceid1',
						name: 'fakeinstancename1',
						status: 'fakestatus1',
						image: 'fakeimagename1',
						create_time: 'fakecreatedtime1'
					}
				]
			},
			{
				vm_spec_name: 'stack2',
				stack_status: 'CREATE_FAILED',
				failed_events: [
					{
						resource_status_reason: 'Resource CREATE failed: InternalServerError: fake'
					},
					{
						resource_status_reason: 'InternalServerError: resources.worker_auto_scaling_group.resources.xwsvh4v4ayfu.resources.floating_ip: delete_port_precommit failed.'
					}
				]
			},
			{
				vm_spec_name: 'stack3',
				stack_status: 'CREATE_IN_PROGRESS',
			}
		];
		assert.equal(JSON.stringify(success_data), JSON.stringify(response.json.getCall(0).args[0]));
	});
	
	test('rest getDeployTaskStackInfo: any instance is missing case', function(done){
		var request = new PassThrough();
		request.params = {};
		request.params.id = "fakeid";
		var response = new PassThrough();
		response.set = sinon.spy();
		response.json = sinon.stub();
		fakeheat.getStacksList = sinon.stub();
		var fakestacks = {
			stacks:[
				{
					id : "fakestackid1",
					stack_name : "fakestackname1",
					stack_status : "CREATE_COMPLETE"
				},
				{
					id : "fakestackid2",
					stack_name : "TaaS_fakeprojid_stack2",
					stack_status : "CREATE_FAILED"
				},
				{
					id : "fakestackid3",
					stack_name : "TaaS_fakeprojid_stack3",
					stack_status : "CREATE_IN_PROGRESS"
				}
			]
		};
		var fakestack1 = {
			stack:{
				id : "fakestackid1",
				stack_name: "fakestackname1",
				stack_status : "CREATE_COMPLETE",
				parameters:{
					flavor: 'fakeflavor1',
					key_name: 'fakekeyname1' 
				},
				outputs: [
					{
						output_value: [
							'fakepublicip1'
						],
						output_key: 'floating_ip'
					},
					{
						output_value: 'fakevmspecname1',
						output_key: 'vm_spec_name'
					},
					{
						output_value: [
							'fakeprivateip1'
						],
						output_key: 'private_ip'
					},
					{
						output_value: [
							'fakeinstancename1'
						],
						output_key: 'server_name'
					}
				]
			}
		}
		var fakestack2 = {
			stack:{
				id : "fakestackid2",
				stack_name: "TaaS_fakeprojid_stack2",
				stack_status : "CREATE_FAILED",
				parameters:{
					flavor: 'fakeflavor2',
					key_name: 'fakekeyname2' 
				}
			}
		}
		var fakestack3 = {
			stack:{
				id : "fakestackid3",
				stack_name: "TaaS_fakeprojid_stack3",
				stack_status : "CREATE_IN_PROGRESS",
				parameters:{
					flavor: 'fakeflavor3',
					key_name: 'fakekeyname3' 
				}
			}
		}
		var fakeevents1 = JSON.stringify([
			{
				"resource_name": "fakestackname2",
				"resource_status": "CREATE_FAILED",
				"resource_status_reason": "Resource CREATE failed: InternalServerError: fake"
			},
			{
				"resource_name": "worker_auto_scaling_group",
				"resource_status": "CREATE_FAILED",
				"resource_status_reason": "InternalServerError: resources.worker_auto_scaling_group.resources.xwsvh4v4ayfu.resources.floating_ip: delete_port_precommit failed."
			}
		]);
		var fakeinstance1 = JSON.stringify({
			server: {
				id: "fakeinstanceid1",
				name: "fakeinstancename1",
				image: {
					id: "fakeimageid1"
				},
				status: "fakestatus1",
				created: "fakecreatedtime1"
			}
		});
		var fakeimage1 = JSON.stringify({name: "fakeimagename1"});
		fakeheat.getStacksList.callsArgWith(0, null, fakestacks);
		fakeheat.getStackWithID = sinon.stub();
		fakeheat.getStackWithID.withArgs("fakestackname1", "fakestackid1").callsArgWith(2, null, fakestack1);
		fakeheat.getStackWithID.withArgs("TaaS_fakeprojid_stack2", "fakestackid2").callsArgWith(2, null, fakestack2);
		fakeheat.getStackWithID.withArgs("TaaS_fakeprojid_stack3", "fakestackid3").callsArgWith(2, null, fakestack3);
		fakeheat.getStackEventList = sinon.stub();
		fakeheat.getStackEventList.withArgs("TaaS_fakeprojid_stack2", "fakestackid2").callsArgWith(2, null, fakeevents1);
		fakeunderscore.find = sinon.stub();
		fakeunderscore.filter = sinon.stub();
		fakeunderscore.filter.onCall(0).returns(fakestacks.stacks);
		fakeunderscore.filter.onCall(1).returns(JSON.parse(fakeevents1));
		fakenova.findInstanceIdByName = sinon.stub();
		fakenova.findInstanceIdByName.withArgs("fakeinstancename1").callsArgWith(1, new Error('can not find instance'));
		fakenova.getInstanceByID = sinon.stub();
		fakenova.getInstanceByID.withArgs("fakeinstanceid1").callsArgWith(1, null, fakeinstance1);
		fakeglance.getImageByID = sinon.stub();
		fakeglance.getImageByID.withArgs("fakeimageid1").callsArgWith(1, null, fakeimage1);
		fakeGetDeployTaskStackInfo.get.getCall(0).args[0](request, response);
		var responsetext = "";
		response.on('data', function(chunk){
			responsetext += chunk.toString();
		});
		response.on('end', function(){
			assert.equal('can not find instance', responsetext);
			done();
		});
	});
});

var sinon = require('sinon');
var assert = require('chai').assert;
// noCallThru prevent proxyquire from running the orginal module-
var proxyquire = require('proxyquire').noCallThru();
var fakesession = {};
var fakeconfig = {};
var fakeMongoose = {model: sinon.stub()};
var fakeProject = {};
var fakeTesttask = {};
fakeMongoose.model.withArgs('project').returns(fakeProject);
fakeMongoose.model.withArgs('testtasks').returns(fakeTesttask);
var fakerender = {};
var fakeproj = {};
var fakejob = {};
var fakeJenkinsFactory = {JenkinsFactory: {}};
var faketimeLib = {};
var fakelogging = sinon.stub();
fakelogging.log_routes = sinon.stub();
fakelogging.log_routes.returns(fakelogging);
fakelogging.setLevel = sinon.stub();

var testTask = proxyquire('../../../routes/TestTask/testTask.js',
	{
		"mongoose": fakeMongoose,
		"../../config": fakeconfig,
		"../../lib/session.js": fakesession,
		"../../lib/render.js": fakerender,
		"../Project/project.js": fakeproj,
		"../../models/jenkins/job.js": fakejob,
		"../../models/jenkins/factory": fakeJenkinsFactory,
		"../../lib/time": faketimeLib,
		"../../lib/logging": fakelogging
	}
);

suite('routes/TestTask/testTask.js', function(){
	test('getInfomationOfBuildHistory: normal case',function(){
		var fakebody = {
			TaskId: 'faketaskid'
		}
		var fakejob = {
			jobname: 'fakejob',
			jobtype: 'test/selenium'
		}
		var fakeresult = [
			{
				number: 2,
				timestamp: 1434567890
			},
			{
				number: 1,
				timestamp: 1234567890
			}
		]
		fakeTesttask.findById = sinon.stub();
		fakeTesttask.findById.withArgs('faketaskid').callsArgWith(1, null, fakejob);
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance.withArgs('test/selenium', 'fakejob').returns(fakeJenkinsFactory.JenkinsFactory);
		fakeJenkinsFactory.JenkinsFactory.getRunStatusHistory = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.getRunStatusHistory.callsArgWith(0, null, fakeresult);
		faketimeLib.formatTime = sinon.stub();
		faketimeLib.formatTime.withArgs(1234567890).returns('1970-01-15 14:56:07');
		faketimeLib.formatTime.withArgs(1434567890).returns('1970-01-17 22:29:27');
		var fakereq = {
			body: fakebody
		}
		var fakeres = {
			json:sinon.stub(),
			end: sinon.stub()
		}
		testTask.getInfomationOfBuildHistory(fakereq, fakeres);
		// check res.json is called with correct arguments
		assert.equal(fakeres.json.getCall(0).args[0][0].number, 2);
		assert.equal(fakeres.json.getCall(0).args[0][0].timestamp, '1970-01-17 22:29:27');
		assert.equal(fakeres.json.getCall(0).args[0][1].number, 1);
		assert.equal(fakeres.json.getCall(0).args[0][1].timestamp, '1970-01-15 14:56:07');
	});

	test('getInfomationOfBuildHistory: error case',function(){
		var fakebody = {
			TaskId: 'faketaskid'
		}
		var fakejob = {
			jobname: 'fakejob',
			jobtype: 'test/selenium'
		}
		var fakeresult = [
			{
				number: 2,
				timestamp: 1434567890
			},
			{
				number: 1,
				timestamp: 1234567890
			}
		]
		fakeTesttask.findById = sinon.stub();
		fakeTesttask.findById.withArgs('faketaskid').callsArgWith(1, null, fakejob);
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance.withArgs('test/selenium', 'fakejob').returns(fakeJenkinsFactory.JenkinsFactory);
		fakeJenkinsFactory.JenkinsFactory.getRunStatusHistory = sinon.stub();0
		fakeJenkinsFactory.JenkinsFactory.getRunStatusHistory.callsArgWith(0, new Error('404 Not Found'));
		faketimeLib.formatTime = sinon.stub();
		faketimeLib.formatTime.withArgs(1234567890).returns('1970-01-15 14:56:07');
		faketimeLib.formatTime.withArgs(1434567890).returns('1970-01-17 22:29:27');
		var fakereq = {
			body: fakebody
		}
		var fakeres = {
			json:sinon.stub(),
			end: sinon.stub()
		}
		testTask.getInfomationOfBuildHistory(fakereq, fakeres);
		assert.equal(fakeres.end.getCall(0).args[0], '404 Not Found');
	});

	test('getLastBuildInfo: normal case',function(){
		var fakebody = {
			TaskId: 'faketaskid'
		}
		var fakereq = {
			body: fakebody
		}
		var fakeres = {
			json:sinon.stub(),
			end: sinon.stub()
		}
		var fakejob = {
			jobname: 'fakejob',
			jobtype: 'test/selenium'
		}
		var fakeresult = [
			{
				number: 2,
				result: 'SUCCESS',
				timestamp: 1434567890
			}
		]
		fakeTesttask.findById = sinon.stub();
		fakeTesttask.findById.withArgs('faketaskid').callsArgWith(1, null, fakejob);
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance.withArgs('test/selenium', 'fakejob').returns(fakeJenkinsFactory.JenkinsFactory);
		fakeJenkinsFactory.JenkinsFactory.getRunStatus = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.getRunStatus.callsArgWith(0, null, fakeresult);
		testTask.getLastBuildInfo(fakereq, fakeres);
		assert.equal(fakeres.json.getCall(0).args[0][0].number, 2);
		assert.equal(fakeres.json.getCall(0).args[0][0].status, 'SUCCESS');
	});

	test('getLastBuildInfo: status Waiting case',function(){
		var fakebody = {
			TaskId: 'faketaskid'
		}
		var fakereq = {
			body: fakebody
		}
		var fakeres = {
			json:sinon.stub(),
			end: sinon.stub()
		}
		var fakejob = {
			jobname: 'fakejob',
			jobtype: 'test/selenium'
		}
		var fakeresult = [
			{
				number: null,
				result: null,
				timestamp: 1434567890
			}
		]
		fakeTesttask.findById = sinon.stub();
		fakeTesttask.findById.withArgs('faketaskid').callsArgWith(1, null, fakejob);
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance.withArgs('test/selenium', 'fakejob').returns(fakeJenkinsFactory.JenkinsFactory);
		fakeJenkinsFactory.JenkinsFactory.getRunStatus = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.getRunStatus.callsArgWith(0, null, fakeresult);
		testTask.getLastBuildInfo(fakereq, fakeres);
		assert.equal(fakeres.json.getCall(0).args[0][0].number, null);
		assert.equal(fakeres.json.getCall(0).args[0][0].status, 'Waiting');
	});

	test('getLastBuildInfo: status Running case',function(){
		var fakebody = {
			TaskId: 'faketaskid'
		}
		var fakereq = {
			body: fakebody
		}
		var fakeres = {
			json:sinon.stub(),
			end: sinon.stub()
		}
		var fakejob = {
			jobname: 'fakejob',
			jobtype: 'test/selenium'
		}
		var fakeresult = [
			{
				number: 2,
				result: null,
				timestamp: 1434567890
			}
		]
		fakeTesttask.findById = sinon.stub();
		fakeTesttask.findById.withArgs('faketaskid').callsArgWith(1, null, fakejob);
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.buildJobInstance.withArgs('test/selenium', 'fakejob').returns(fakeJenkinsFactory.JenkinsFactory);
		fakeJenkinsFactory.JenkinsFactory.getRunStatus = sinon.stub();
		fakeJenkinsFactory.JenkinsFactory.getRunStatus.callsArgWith(0, null, fakeresult);
		testTask.getLastBuildInfo(fakereq, fakeres);
		assert.equal(fakeres.json.getCall(0).args[0][0].number, 2);
		assert.equal(fakeres.json.getCall(0).args[0][0].status, 'Running');
	});
});
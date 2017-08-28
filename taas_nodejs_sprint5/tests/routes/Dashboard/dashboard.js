require('../../../routes/DBM/databaseManagement');
var request = require("request");
var assert = require('assert');
var http = require('http');		
var conf = require('../../../lib/config');
var PassThrough = require('stream').PassThrough;
var sinon = require('sinon');
//var dashboard = require('../../../routes/Dashboard/dashboard.js');
var async = require('async');
var proxyquire = require('proxyquire');


const HOSTIP = conf.get('host_address');
const prepareReportData_url = HOSTIP+"/prepareReportData";



var jobName =  "Selenium-20160427-6850b589";
var jobType = "test/selenium";
var runNumber = 2;
var tab = "testTab";
var pie = "pie";
var userMail = "ss@hotmail.com";
var task = "testTesk";
var chartType = "testChartType";
var moveTime = "testMoveTime";
var dom = "testDom";
var css = "testCss";
var parmList = {};
var job = "testJob";

var fakeDashboar_lib ={
	getRunJobResData : function(){},
	getRunStatus : function(){},
	getAskAutoReflesh : function(){return "success";},
	getAutoReflesh : function(){return "success";},
	savetoDashLayout : function(){return "success";},
	saveCsstoDashLayout : function(){return "success";},
	saveNoShowtoDBbyDOM : function(){return "success";},
	showDashLaybyTab : function(){return "success";}, 
	findDashLayoutbyDOMid : function(){return "success";},
	removeDashLayoutbyTab : function(){return "success";},
	removeDashLayoutbyDOM : function(){return "success";},
	isDomExisted : function(){return "success";},
	throwException : function(){return "error";}
}
var fakeSession = {
	getSessofEmail :  function(req){ return userMail;},
	checkLoginbySess : function(){}
}
var fakeCrudMongo = {
	crudMongo : {	
		update : function(){}
	}
}

var dashboard = proxyquire('../../../routes/Dashboard/dashboard', {
    '../../lib/dashboard.js': fakeDashboar_lib,
    '../../lib/session.js' : fakeSession,
    '../../lib/crudMongodb.js' : fakeCrudMongo
});



/**
 * fakeHttpRequest for get / post
 * @type {Object}
 */
var fakeHttpRequest = {
	get: function(callback) {
		var req = http.request({
			hostname: 'itp4.itri.org.tw',
			path: '/posts/1'
		}, function(response) {
			var data = '';
			response.on('data', function(chunk) {
				data += chunk;
			});
 
			response.on('end', function() {
				callback(null, JSON.parse(data));
			});
		});
 		req.on('error', function(err) {
			callback(err);
		});
		req.on('success', function(err) {
			callback(err);
		});
		req.end();
	},

	post: function(data, callback) {
		var req = http.request({
			hostname: 'itp4.itri.org.tw',
			path: '/posts',
			method: 'POST'
		}, function(response) {
			var data = '';
			response.on('data', function(chunk) {
				data += chunk;
			});

			response.on('end', function() {
				callback(null, JSON.parse(data));
			});
		});
 
		req.write(JSON.stringify(data));
 
		req.end();
	}
};

/**
 * for test routes/Dashboard/dashboard.js 
 */
describe('routes/Dashboard/dashboard.js', function() {

	beforeEach(function() {
		this.request = sinon.stub(http, 'request'); // for fake http request
	});
 
	afterEach(function() {
		http.request.restore(); // for fake http request
	});

  
	it("prepareReportData : normal case : mode = pie ", function(done){

		var body = {jobName : jobName,
					jobType : jobType,
					runNumber : runNumber
		};
		var params = {mode : "pie"}
		var param = {body : body,
					 params : params
		};
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 
		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.prepareReportData(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
	
			//var res = dashboard.prepareReportData(req, null);
			
		});
	});


		
	it("prepareReportData : normal case : mode = null ", function(done){

		var body = {jobName : jobName,
					jobType : jobType,
					runNumber : runNumber
		};
		var params = {mode : null}
		var param = {body : body,
					 params : params
		};
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.prepareReportData(req, null));
		    	}
			], function (err, res) {
    			assert.deepEqual(res,"error");
				done();
			});

			
		});

	});

	it("getRunStatus : normal case ", function(done){

		var body = {jobName : jobName,
					jobType : jobType,
					getElement : "dateTime"
		};
		var param = {body : body
		};
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.getRunStatus(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("updateAskAutoReflesh : normal case ", function(done){

		var body = {boolAsk : true,
					boolAuto : true,
		};
		var params = { tab : tab};
		var param = { body : body,
					  params : params
		};
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.updateAskAutoReflesh(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("getAskAutoReflesh : normal case ", function(done){

		var params = {tab : tab}
		var param = {params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.getAskAutoReflesh(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("getAutoReflesh : normal case ", function(done){

		var params = {tab : tab}
		var param = {params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.getAutoReflesh(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("savetoDashLayout : normal case ", function(done){
		var body = {tab : tab,
					task : task,
					chartType : chartType,
					moveTime : moveTime,
					dom : dom,
					css : css,
					parmList : parmList,
					job : job
		};
		var param = {body : body
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.savetoDashLayout(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("saveCsstoDashLayout : normal case ", function(done){
		var body = {memoCSSObj : '{}',
					moveTime : moveTime
		};
		var param = {body : body
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.saveCsstoDashLayout(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("saveNoShowtoDBbyDOM : normal case ", function(done){
		var body = {memoCSSObj : '{}',
					moveTime : moveTime
		};
		var param = {body : body
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.saveNoShowtoDBbyDOM(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});
//
	it("showDashLaybyTab : normal case ", function(done){
		var params = { tab : tab};
		var param = { 
					  params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.showDashLaybyTab(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("removeDashLayoutbyTab : normal case ", function(done){
		var params = { tab : tab};
		var param = { 
					  params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.removeDashLayoutbyTab(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});

	it("removeDashLayoutbyDOM : normal case ", function(done){
		var params = { dom : dom};
		var param = { 
					  params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			dashboard.removeDashLayoutbyDOM(req, null, function(res){
				//assert.deepEqual(res, "success");
				done();
			});

		});
	});

	it("isDomExisted : normal case ", function(done){
		var params = { dom : dom};
		var param = { 
					  params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			async.waterfall([
				function(callback) {
		        	callback(null, dashboard.isDomExisted(req, null));
		    	}
			], function (err, res) {
    			assert.notEqual(res,"error");
    			assert.deepEqual(typeof res, "undefined");
				done();
			});
		});
	});


	//addReport
	//spiratest
	it("spiratest : normal case ", function(done){
		var params = { dom : dom};
		var param = { 
					  params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			done();
		});
	});

	it("jira : normal case ", function(done){
		var params = { dom : dom};
		var param = { 
					  params : params
		};
		
		var response = new PassThrough();
		response.write(JSON.stringify(param));
		response.end();
		var request = new PassThrough();
		//The numbering starts from 0, so using 1 refers to the second parameter
		this.request.callsArgWith(1, response)
		            .returns(request); 

		fakeHttpRequest.get(function(err, req) {
			done();
		});
	});

	

})

/**
 *
 *2016/03/02(Kristen)
 *fix getSelePytPieopts bug 2016/03/02 kristen
 *
 *2016/02/24(Kristen)
 *create two funtion :getSelePytHTML getSelePytPie for selenium report
 *require cheerio, htmlparser, fs
 *
 *2016/02/21(Daniel)
 *update result value in statistics schema
 *
 *2016/01/28(Daniel)
 *delete dashboard tab name in db
 *
 *
 *2016/01/28(Daniel)
 *Save dashboard tab name in db
 *
 */

var mongoose = require('mongoose');
var session = require('../../lib/session.js');
var dashboar_lib = require('../../lib/dashboard.js');
var CM = require('../../lib/crudMongodb.js');
var render = require('../../lib/render.js');
var DashboardTab = mongoose.model('DashboardTab');
var Testtask = mongoose.model('testtasks');
var Project = mongoose.model('project');
var cheerio = require('cheerio');
var htmlparser = require("htmlparser2");
var fs = require("fs");
var async = require('async');
var logging = require('../../lib/logging'); //require logger module
logDash = logging.log_routes('Dashboard'); // Set up Category
logDash.setLevel('all'); //set logger level



/**
 * prepare Report Data
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 * 
 */
exports.prepareReportData = function(req, res, callback){
	var mode = req.params.mode;
	var tab = req.body.tab;
	var jobName = req.body.jobName; //jobname != takname
	var jobType = req.body.taskType;
	var runNumber = req.body.runNumber;

	if( mode == "pie" ){

		dashboar_lib.getRunJobResData(tab,jobType,jobName,runNumber, res);	
	}
	else if( mode == "origin"){
		dashboar_lib.getFilePathforReport(tab, jobName, jobType, runNumber,dashboar_lib.getTaskOriginReport,res);
	}
	else if( mode == "logMsg"){
		dashboar_lib.getJobLog(jobName, jobType, runNumber, res);
	}else{
		return dashboar_lib.throwException();
	}
}

/**
 * get Run Status by job
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.getRunStatus = function(req, res, callback){
	var jobName = req.body.jobName; //jobname != takname
	var jobType = req.body.jobType;
	var getElement = req.body.getElement;
	if( jobName !== 'undefined' &&  jobType !== 'undefined' && getElement !== 'undefined')
		dashboar_lib.getRunStatus(jobType, jobName, getElement, res);
	else
		return dashboar_lib.throwException();
}
	
/**
 * update options of 'asking dialog/system message'  for AutoReflesh 
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.updateAskAutoReflesh = function(req, res, callback){
	var tab = req.params.tab;
	var boolAsk = (req.body.boolAsk === 'true');
	var boolAuto = (req.body.boolAuto === 'true');
	var user_mail = session.getSessofEmail(req);
	var jsonUpData = {};
	if(req.body.boolAuto == 'undefined' || req.body.boolAuto == undefined){
		jsonUpData = {
			autoRefleshAsk : boolAsk
		}
	}else{
		jsonUpData = {
			autoRefleshAsk : boolAsk,
			autoReflesh : boolAuto
		}
	}
	var jsonCondition = {
		tab : tab,
		email : user_mail
	} 

	CM.crudMongo.update(jsonCondition, jsonUpData, "DashboardTab" , function(jsonRes){
		if ( jsonRes ){
			res.end(jsonRes.toString());
		}else{
			logDash.debug('updateAskAutoReflesh: ' + resQuery );
			dashboar_lib.throwException();
			//res.end();
		}
	})
	
	//dashboar_lib.updateAskAutoReflesh(tab, user_mail, res);
}

/**
 * get 'showing dialog/system message' (true/false) of tab for asking AutoReflesh 
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.getAskAutoReflesh = function(req, res, callback){
	var tab = req.params.tab;
	var user_mail = session.getSessofEmail(req);
	dashboar_lib.getAskAutoReflesh(tab, user_mail, res);
}

/**
 * get auto-reflesh (true/false) of tab for AutoReflesh 
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.getAutoReflesh = function(req, res, callback){
	var tab = req.params.tab;
	var user_mail = session.getSessofEmail(req);
	dashboar_lib.getAutoReflesh(tab, user_mail, res);
}
/**
 * save all memo to DashLayout collection in mongodb
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.savetoDashLayout = function(req, res, callback){
	var tab = req.body.tab;
	var task = req.body.task;
	var chartType = req.body.chartType;
	var moveTime = req.body.moveTime;
	var dom = req.body.dom; 
	var css = req.body.css;
	var parmList = req.body.parmList;
	var job = req.body.job;
	//var autoReflesh = req.body.autoReflesh;
	var user_mail = session.getSessofEmail(req);						
	var result = dashboar_lib.savetoDashLayout(user_mail,tab, task, chartType, moveTime, dom, css, parmList, job, res);
	res.end(result);
}

/**
 * save all memo Css to DashLayout collection in mongodb
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.saveCsstoDashLayout = function(req, res, callback){
	
	//var dom = req.body.dom; 
	//var css = req.body.css;
	var user_mail = session.getSessofEmail(req);
	var memoCSSObj = JSON.parse(req.body.memoCSSObj);
	var moveTime = req.body.moveTime;
	//var strAutoReflesh = req.body.strAutoReflesh;

	for(var memoDom in memoCSSObj){
		//dashboar_lib.saveCsstoDashLayout(strAutoReflesh, moveTime, memoDom, memoCSSObj[memoDom], res);
		dashboar_lib.saveCsstoDashLayout(user_mail, moveTime, memoDom, memoCSSObj[memoDom], res);
	}

}
/**
 * save NoShow column (true/false) to DashLayout collection in mongodb
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.saveNoShowtoDBbyDOM= function(req, res, callback){
	var dom = req.body.dom;
	dashboar_lib.saveNoShowtoDBbyDOM(dom, res);

}

/**
 * get all memo from DashLayout collection by tab
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.showDashLaybyTab = function(req, res, callback){
	
	var tab = req.params.tab;
	//console.log(tab)
	var resQuery = dashboar_lib.showDashLaybyTab(tab, req, function(resQuery){
		//console.log("showDashLaybyTab")
		//console.log(resQuery)
		res.end(resQuery);
	});
	
	
}

/**
 * find memo from DashLayout collection DashLayout by DOM id
 * @param  {Object}
 * @param  {Object}
 * @param  {Function}
 */
exports.findDashLayoutbyDOMid = function(req, res, callback){
	
	var dom = req.params.dom;
	dashboar_lib.findDashLayoutbyDOMid(dom, res);
}
/**
 * delete all memo from DashboardLayout collection and delete tab from DashLayout collection
 * @param  {Object}
 * @param  {Object}
 */
exports.removeDashLayoutbyTab = function(req, res) { //removeDashLayoutbyTab dashboardtab_delete
	var user_id = session.getSessofEmail(req);
	session.checkLoginbySess(req, res);
	dashboar_lib.removeDashLayoutbyTab(req.params.tab, "DashboardLayout", function(){
		//console.log("@@@@@@@@DashboardLayout"+req.params.tab)
		dashboar_lib.removeDashLayoutbyTab(req.params.tab, "DashboardTab",function(){
				//console.log("@@@@@@@@DashboardTab"+req.params.tab)
			res.end("true");
		});
	});



};

/**
 * delete memo from DashboardLayout collection by DOM id
 * @param  {Object}
 * @param  {Object}
 */
exports.removeDashLayoutbyDOM = function(req, res) {

	var dom = req.params.dom;
	//console.log("@@@@@@@@removeDashLayoutbyDOM"+dom)
	dashboar_lib.removeDashLayoutbyDOM(dom , res);
};

/**
 * find memo in DashboardLayout existed or not
 * @param  {Object}
 * @param  {Object}
 */
exports.isDomExisted = function(req, res){
	var dom = req.params.dom;
	dashboar_lib.isDomExisted(dom , res);
}

					
/*2016/03/22 ¡@¡@¡@
*@addReport : click "Add report"
* then call jenkins result by jobType and jobName.
* > get duration and timestamp for each task of project.
* > format data :
*
*   [{ 
*       "project" : projectName	
*		"fieldName":["taskName1","taskName2"],
*        "series":[{"z":"taskName1","x":timestamp,"y":duration},
*                     {"z":"taskName1","x":timestamp,"y":duration},
*                     {"z":"taskName1","x":timestamp,"y":duration},
*                     {"z":"taskName2","x":timestamp,"y":duration},
*                     {"z":"taskName2","x":timestamp,"y":duration}],
*        "successFail":[1,1,0,1,1] 
*    }]
*
*  > successFail: 1 =success , 0 = fail
*
*/
//20160322 move from rutes/testTask.js by kristen

/**
 * when click "addReport" button then showing tasks of all project  by datetime
 * then prepare job status and duration of running tasks
 * @param  {Object}
 * @param  {Object}
 */
exports.addReport = function(req, res) {
	var user_id = session.getSessofEmail(req);
	//console.log("req.body.project::::::" + Project);
	var dashboardProj = req.body.project;
	var dashboardTabname = req.body.tabname;

	session.checkLoginbySess(req, res);
	logDash.debug(user_id + ' call tasklist');

	Project.
	find({
		email: user_id,
		proj_name: dashboardProj
	}).exec(function(err, projs) {

	
		if (projs.length > 0) {
			Testtask.
			find({
				proj_id: projs[0]._id
			}).
			sort({testtaskname: -1}). //order by taskname 2016/03/03
			exec(function(err, tstask) {//----------
				//updateStatistic(user_id,dashboardTabname,projs[0]._id,dashboardProj);
				dashboar_lib.getRunTimebyJenkins(tstask,dashboardProj,res);
				//	console.log( resData);
				
			});//------------
		} else {
			res.end();
		}
	});

}

exports.getRunningOrnot = function(req, res) {
	var jobName = req.body.jobName; //jobname != takname
	var jobType = req.body.jobType;
	logDash.debug(' getRuningOrnot');
	dashboar_lib.getRunningOrnot(jobName, jobType, res);
}


/**
 * showing all tabs when turning view to dashboard.ejs
 * @param  {Object}
 * @param  {Object}
 * @param  {Function} callback [description]
 */
exports.dashboard = function(req, res, callback) {
	var user_id = session.getSessofEmail(req);
	session.checkLoginbySess(req, res);
	logDash.debug(user_id + ' call dashboard');

	DashboardTab.find({
		email: user_id
	}).exec(function(err, dashB) {
		//console.log("dashB");
		//console.log(dashB);
		var jsonDashB = {
			dashB : dashB,
			funEncodeSpace : funEncodeSpace,
			funDecodeSpace : funDecodeSpace 
		};
		//console.log('[Debug] dashB = ' + dashB);
		render.render(req, res, 'dashboard', 'Dashboard', jsonDashB);
	});
};

/**
 * add tab and insert to DashboardTab collection
 * @param {Object}
 * @param {Object}
 * @param {Function}
 */
exports.addTab = function(req, res, callback) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);
	logDash.debug(user_id + ' addTab');
	var tabname = req.body.tabname;

	//console.log("selectTab=" + req.body.selectTab);
	//console.log("hasContent=" + req.body.hasContent);
	var dashboard_tab = new DashboardTab({
		email: session.getSessofEmail(req),
		tab : req.body.tabname,
		//proj_id: "",
		//results: req.body.hasContent, //save temp data, add by koli
		createtime: Date.now()
	});

	dashboard_tab.save(function(err, anim, num) {
		if (err) {
			res.writeHead(200, {
				"Content-Type": "text/plain"
			});
			res.write("email already exists");
			res.end();
		} else {
			res.writeHead(200, {
				"Content-Type": "text/plain"
			});
			res.write("success");
			//res.render('addTestTask_os.ejs');
			res.end();
		}
	});
};


/**
 * render to spiratest
 * @param {Object}
 * @param {Object}
 * @param {Object}
 */
exports.spiratest = function(req, res, next) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);
	logDash.debug(user_id + ' spiratest');
	render.render(req, res, 'spiratest', 'SpiraTest');
};
/**
 * render to jira
 * @param {Object}
 * @param {Object}
 * @param {Object}
 */
exports.jira = function(req, res, next) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);
	logDash.debug(user_id + ' jira');
	render.render(req, res, 'jira', 'JIRA');
};

/**
 * replace space character to '____'
 * @param  {String}
 * @return {String} 
 */
function funEncodeSpace(str) {

	return str.replace(/ /g, '_____');
}
/**
 * replace '____' character to ' '
 * @param  {String}
 * @return {String} 
 */
function funDecodeSpace(str) {

	return str.replace(/____/g, ' ');
}

var async = require('async');
var JFactory = require('../models/jenkins/factory');
var seleniumJob = require('../models/jenkins/seleniumJob.js'); 
var timeZoneFormat = require('./time.js'); 
var mongoose = require('mongoose');
var DashboardLayout = mongoose.model('DashboardLayout');
var DashboardTab = mongoose.model('DashboardTab');
var CM = require('./crudMongodb.js');
var session = require('./session.js');
var logging = require('./logging'); //require logger module
logDash = logging.log_routes('Dashboard'); // Set up Category
logDash.setLevel('all'); //set logger level

/**
 * getRunTimebyJenkins: for runtime report (line chart)
 * get data from jenkins job
 * @param  {Array} Array list
 * @param  {String} project name
 * @param  {Object} res
 * *=========================return===================================================
* 
*
* [
*	{   "project":"projectName",
*	    "fieldName":["fieldName1(taskname)","fieldName2","fieldName3"..],
*	    "series":[{"z":"fieldName1","x":timestamp,"y":duration},
*	    		  {"z":"fieldName1","x":timestamp,"y":duration},
*	    		  {"z":"fieldName2","x":timestamp,"y":duration}}],
*	    "successFail":[1,0,1,1] //success = 1
*	},
*	{   "tableOption":[["YYYY/MM/dd","hh:mm:ss","fieldName1","jobtype","SUCCESS/fail",intRunRumber, jobName(fileName)],
*				["2016/3/18","2:08:56","fieldName1","test/selenium","SUCCESS",intRunRumber, jobName(fileName)],
*				["2016/3/21","5:31:37","html","test/selenium","SUCCESS",intRunRumber, jobName(fileName)]]
*	}
*]
*
*
* # [0] for summary "line chart"
* # [1] for making "option table" that could chosen to create chart
*/
var getRunTimebyJenkins = function(taskList,project,res){
				
				var taskName = new Array();
				var series = [];
				var tableOption = [];
				var successFail = [];
				async.each(taskList,function(task,callback) {
					
					//get run time by jenkins api

//**NEED TO FIX*************************************************************jobtype should get form db 2016/03/02

					var jobtype = task.jobtype; //test/selenium; 
					var jobName = task.jobname;
						taskName.push(task.testtaskname);
					if(jobtype != undefined && jobtype != ""){
						//console.log(jobtype)
						var sj = new JFactory.JenkinsFactory.buildJobInstance(jobtype,jobName);
						sj.getRunStatusHistory(function(err, runs) {
							if(err) console.log("err: "+err);
							else if(runs != null){
									
								runs.forEach(function(runh) {
									var createTaskDate = getDateTimebytimeStamp(parseInt(runh.timestamp)).formatDate;
									var createTaskTime = getDateTimebytimeStamp(parseInt(runh.timestamp)).formattedTime;
									var taskName = task.testtaskname;
									
										if (jobtype.split("test").length > 1) { // filter git, deploy, build
										tableOption.push([createTaskDate,createTaskTime,taskName,jobtype,runh.result,runh.number,jobName])
									}
									//console.log("===========bbbbbbbbbbbbbbbbbbbb========");
									//console.log("[getTaskhistory]" + runh.duration + "[getTaskhistory]" + runh.timestamp);
									series.push({ z : task.testtaskname, x :  runh.timestamp, y: runh.duration});
									if(runh.result == "SUCCESS") successFail.push(1);
									else successFail.push(0);
									//console.log(series);

								});
							}
							
							callback();
						});
					}
				

				},function(err){
					var dataJson = [];
					
			    	dataJson.push({ project: project, fieldName : taskName, series: series,successFail:successFail  });
			    	dataJson.push({ tableOption: tableOption});
			    	//console.log("===========xxxxxxxxxxxxxxxxxxxxxx========");
					//console.log(JSON.stringify(dataJson));
					res.end(JSON.stringify(dataJson));
					
				 })///taskList.forEach
					

	
}

var getRunningOrnot = function(jobName, jobtype, res){
	 //console.log("$$$$$$$$$$$$$$$$");
	var sj = new JFactory.JenkinsFactory.buildJobInstance(jobtype,jobName);
	sj.getRunStatus(function(err, runs) {
		if(err) console.log("getRunningOrnot err: "+ err.toString());
		else if(runs != null){
			var runRes = runs.pop();
			res.end(runRes.result);
		}else{
			 console.log(runs);
		}

	})

}

/**
 * get Job Log
 * @param  {String} job Name
 * @param  {String} job type
 * @param  {String} job Run Number
 * @param  {Object} res
 */
function getJobLog(jobName, jobtype, jobRunNumber, res) {

	var job = new JFactory.JenkinsFactory.buildJobInstance(jobtype,jobName);
	var opts = {runNumber: parseInt(jobRunNumber) };
	job.getRunLog(opts, function(err, log) {
		if (err)
			res.end(err);
		else
			res.end(log);
	});

}

/**
 * String filter 
 * @param  {String} find String to filter
 * @param  {Object} obj List
 */
function filterStr(strFilter,objList){

  for(var i in objList){
    objList[i] = objList[i].replace(strFilter,"");
  }
  return objList;

}


/**
 * get Job Result Data
 * @param  {String} tab name
 * @param  {String} job Type
 * @param  {String} job Name
 * @param  {Integer} run Number
 * @param  {Object} res
 * @return {Null} res.write()
 * data : [ { x: 'numTestPasses', y: 1 }, { x: 'numTestFailures', y: 0 } ]
 */
var getRunJobResData = function(tab, jobType, jobName, runNumber, res){
	
	var job = JFactory.JenkinsFactory.buildJobInstance(jobType, jobName);
	var opts = {
			runNumber: parseInt(runNumber)
		};
	if(runNumber == "NaN") return res.end("Running");
	job.getRunStatsList(opts, function(err, buf) {

		if (err) {
				return res.end("noFile");
		}
		var objFileID = [];
		var objRes = [];
		var objTemp = [];
		var i = 0;
		while (buf.length > 0){
			objTemp.push(buf.pop());
			objFileID[i] =  objTemp[i].id;
			
			
			i++;
			
		}
		async.each(objFileID,function(dataId, callback){

		opts = {
			runNumber: parseInt(runNumber),
			statsId :　dataId
		};
		    // Call an asynchronous function, often a save() to DB
		    job.getRunStatsPoints(opts, function(err,data,info){
			
			if (err) {
				return res.end("noStatus");
				
			}
     // var  filNames = filterStr("numTest",info.fieldNames);
    
			objRes.push({
				tab : tab,
				taskType : jobType,
				title: info.title,
				fieldNames : info.fieldNames,
				fieldUnits : info.fieldUnits,
				dimension : info.dimension,
				series : data
			})
			callback(err);
		
			})
		  },
		  function(err){

			res.end(JSON.stringify(objRes));
		  }
		);

	})

}


/*
* return
*[ { number: 2,
*    queueId: 1017,
*    result: 'SUCCESS',
*    timestamp: 1461137207237,
*    duration: 77279,
*    inQueue: false } ]
*
*
*
*/
/**
 * get Run Status
 * @param  {String} jobType
 * @param  {String} jobName
 * @param  {String} 2 options tag (datetime / origin)
 * @param  {Object} res
 * @return {Null} res.write()
 */
var getRunStatus = function(jobType, jobName, getElement, res){
	
	var job = JFactory.JenkinsFactory.buildJobInstance(jobType, jobName);
	/*console.log("jobType---" +jobType)
	console.log("jobName---" +jobName)
	console.log("jobName---" +getElement)*/
	job.getRunStatus(function(err, buf) {

		if (err) {
		
				return res.end("noFile");
		}else{
			if(getElement == "dateTime"){
				var obj = buf;
				obj = obj.pop();
				var createTaskDate = getDateTimebytimeStamp(parseInt(obj.timestamp)).formatDate;
				var createTaskTime = getDateTimebytimeStamp(parseInt(obj.timestamp)).formattedTime;
				var result = [{date : createTaskDate,time : createTaskTime}];
				 //console.log(result);
				res.end(JSON.stringify(result));

			}
			else
				res.end(JSON.stringify(buf));
		}
	

	})

}


/**
 * get File Path for Report
 * @param  {String} tab name
 * @param  {String}
 * @param  {Integer}
 * @param  {Function}
 * @param  {Object} res
 * @return {Function}
 * call :
 * 	job.getRunFileList(opts, function(err, fileList) 
 * return type 1: 
 *
 * [ { title: 'RC-HTML (chrome)',
 *	    path: 'Selenium-RC-results-Selenium-20160321-b86b45aa-chrome.html',
 *	    viewable: true },
 *	  { title: 'RC-HTML (firefox)',
 *	    path: 'Selenium-RC-results-Selenium-20160321-b86b45aa-firefox.html',
 *	    viewable: true } ]
 *=======================================================================
 * 
 *return type 2: 
 *
 *[ { title: 'WD-PYTHON',
 *    path: 'Selenium-WD-results-Selenium-20160318-ceb3d7ec.html',
 *    viewable: true } ]
 */
var getFilePathforReport = function(tab, jobName, jobType, runNumber,call_getTaskOriginReport,res){
    // TODO: This function should be rewritten to support the pluggin framework
   //改成新版 JFactory.JenkinsFactory.buildJobInstance(jobType, jobName);
	//var job = new seleniumJob.JenkinsSeleniumJob(jobName);
	var job = new JFactory.JenkinsFactory.buildJobInstance(jobType, jobName);
    var opts = {
        runNumber: parseInt(runNumber)
    };
    job.getRunFileList(opts, function(err, fileList) {
        if (err) {
            return console.log(err.stack);
        }
       return call_getTaskOriginReport(tab,jobName,jobType,runNumber,fileList, res);
    });
}
/**
 * get Task Origin Report
 * @param  {String}
 * @param  {String}
 * @param  {Integer}
 * @param  {Object}
 * @param  {Object} res
 */
var getTaskOriginReport = function(tab,jobName,jobType,runNumber,objFilePaths, res){
    // TODO: This function should be rewritten to support the pluggin framework
 var job = new JFactory.JenkinsFactory.buildJobInstance(jobType, jobName);
 var data;
 var dbTask = new Array();
 var objFile = [];
 while(objFilePaths.length>0){
 	objFile.push(objFilePaths.pop());

 }

 //var ObjFile = objFilePath;
 async.map(objFile, function(file, asyncMapCallback) {


 	var opts = {
    	filePath: file.path,
        runNumber: parseInt(runNumber)
    };
    job.getRunFile(opts, function(err, buf) {
        if (err) {
            return console.log(err.stack);
        }
        data += buf.toString();
        return asyncMapCallback(err);
        })
   }, function(results){
        res.end(data);
        
   });
}

/**
 * @param  {String} timeStamp
 * @return {Object} key[formatDate, formattedTime] -> value[date, time]
 */
var  getDateTimebytimeStamp = function(timeStamp){

	var dateStr = timeZoneFormat.formatTime(timeStamp, 'YYYY-MM-DD');
	var timeStr = timeZoneFormat.formatTime(timeStamp, 'HH:mm:ss');

	return {formatDate: dateStr, formattedTime: timeStr};
}



/*
var Dashboard_Layout = new SCHEMA({
	
	dom: {
		type: String,
		unique: true
	},
	css:{
		type: Object,
		default: []
	},
	parmList:{  //function parameter
		type: Array,
		default: []
	},
	job:{    //job report parameter: [jobName, type ,number]
		type: Array,
		default: []
	},
	noShow:{
		type: Boolean,
		default: false,
	},
	autoReflesh: { //true: auto reflesh, false: as usual
		type: Boolean,
		default: false,
	}
});
*
*
*
*
*/
/**
 * save Css to DashLayout
 * @param  {String} email
 * @param  {String} moveTime
 * @param  {String} dom id
 * @param  {Object} css
 * @param  {Object}
 */
var saveCsstoDashLayout = function(email, moveTime, dom, css, res) {

	var jsonCondition = {
		dom : dom
	}
	var jsonUpData = {
		css : css,
		moveTime : moveTime,
		email : email
	}
	CM.crudMongo.update(jsonCondition, jsonUpData, "DashboardLayout", function(jsonRes){
		//console.log("::saveCsstoDashLayout");
		//console.log(jsonRes);
		if ( jsonRes == false){
		logDash.debug('saveCsstoDashLayout: ' + jsonRes );
		res.end();
		}else{
		res.end('success');
		}
	});

	


}

/**
 * save NoShow(true/false) to DB by DOM
 * @param  {Object}
 * @param  {Object}
 */
var saveNoShowtoDBbyDOM = function(dom, res) {

	var jsonCondition = {
		dom : dom
	}
	var jsonUpData = {
		noShow : true
	}
	CM.crudMongo.update(jsonCondition, jsonUpData, "DashboardLayout", function(jsonRes){
		if ( jsonRes == false){
		logDash.debug('saveNoShowtoDBbyDOM: ' + jsonRes );
		res.end();
		
		}else{
		res.end('success');
		}
	});
	

}

/**
 * save to DashLayout
 * @param  {String} email
 * @param  {String} tab
 * @param  {String} task
 * @param  {String} chartType
 * @param  {Date} moveTime
 * @param  {String}  dom
 * @param  {Object} css
 * @param  {Object} parmList function param
 * @param  {Object} job [jobname,type..]
 * @param  {Object} res
 * @return {Boolean}
 */
var savetoDashLayout = function(email, tab, task, chartType, moveTime, dom, css, parmList, job, res) {

	var jsonSaveData = {
		tab : tab,
		task : task,
		chartType : chartType,
		moveTime : moveTime,
		dom : dom,
		css : css,
		parmList : parmList,
		job : job,
		noShow : false,
		//autoReflesh : autoReflesh,
		email : email
	}
	var jsonFindData = {
		dom : dom
	}
	//console.log("savetoDashLayout");
	//console.log(jsonSaveData);
	//console.log(jsonFindData);
	CM.crudMongo.saveAvoidRepeat(jsonFindData, jsonSaveData, "DashboardLayout", function(jsonRes){
		if ( jsonRes == false){
		//logDash.debug('savetoDashLayout: ' + jsonRes );
		//console.log(false);
		//res.end("false");
		return false;
		
		}else{
		//console.log(true);
		//res.end("true");
		return true;
		}
	});
	

}

/**
 * show all memos by Tab
 * @param  {String}
 * @param  {Object}
 * @param  {Function}
 */
var showDashLaybyTab = function(tab, req, callback) {
	var jsonDashboardLayout = null;
	var autoReflesh = false;
	async.series([
    function(callback){
       var jsonCondition = {
			tab: tab,
			noShow: false
		}
		var strModel = "DashboardLayout";
		CM.crudMongo.findByMulti(jsonCondition, strModel, function(resQuery){
			callback(null, resQuery);
		});
        
    },
    function(callback){
    	var jsonCondiOne = {
			tab: tab
		}
		var strModel = "DashboardTab";
		CM.crudMongo.findByOne(jsonCondiOne, strModel, function(resQuery){
			callback(null, resQuery);
		});

    	}
	],
	// optional callback
	function(err, results){

		if(!err){
			var jsonMemos = {
				memoList : results[0],
				autoReflesh : results[1].autoReflesh
			}
			callback(JSON.stringify(jsonMemos));
			
		}else callback(false);

	});
	

}
/**
 * find memo from DashLayout by DOM id
 * @param  {String} dom id 
 * @param  {Object}
 */
var findDashLayoutbyDOMid = function(dom, res) {
	var jsonCondiOne = {
		dom: dom
	}
	var strModel = "DashboardLayout";
	CM.crudMongo.findByOne(jsonCondiOne, strModel, function(jsonRes){
		if ( jsonRes == false){
			logDash.debug('isDomExisted: ' + jsonRes );
			res.end();
		}else{
			res.end(JSON.stringify(jsonRes));
		}
	})

}
/**
 * is Dom Existed ? write(true/false)
 * @param  {String}
 * @param  {Object}
 */
var isDomExisted = function(dom, res) {
	var jsonCondition = {
		dom: dom,
		noShow: false
	}
	var strModel = "DashboardLayout";
	CM.crudMongo.findByMulti(jsonCondition, strModel, function(jsonRes){
		if ( jsonRes == false){
			logDash.debug('isDomExisted: ' + jsonRes );
			res.end("false");
		}else{
			logDash.debug('isDomExisted: ' + jsonRes );
			res.end("true");	
		}
	})

}
/**
 * remove DashLayout by Tab
 * @param  {String}
 * @param  {String}
 * @param  {Function}
 */
var removeDashLayoutbyTab = function(tab, strModel, callback) {
	//DashboardLayout.find({ dom:dom }).remove().exec();
	var jsonCondition = {
		tab: tab
		}
	//var strModel = "DashboardLayout";
	CM.crudMongo.delete(jsonCondition, strModel, function(jsonRes){
		if ( jsonRes != false){
			callback(jsonRes)
			logDash.debug('removeDashLayoutbyTab: ' + jsonRes );
			//res.end();
		}else{
			callback(jsonRes)
			logDash.debug('removeDashLayoutbyTab: ' + jsonRes );
			//res.end();
		}
	})

}
/**
 * remove DashLayout by DOM
 * @param  {String}
 * @param  {Object}
 */
var removeDashLayoutbyDOM = function(dom, res) {
	var jsonCondition = {
		dom: dom
		}
	var strModel = "DashboardLayout";
	CM.crudMongo.delete(jsonCondition, strModel, function(jsonRes){
		if ( jsonRes != false){
			logDash.debug('removeDashLayoutbyDOM: ' + jsonRes );
			res.end();
		}else{
			logDash.debug('removeDashLayoutbyDOM: ' + jsonRes );
			res.end();
		}
	})
	

}


/**
 * get Ask AutoReflesh  yes(true) or no(false)
 * @param  {String}
 * @param  {String}
 * @param  {Object}
 */
var getAskAutoReflesh = function(tab, user_mail, res)  {
	var jsonCondition = {
		tab : tab,
		email : user_mail
	}
	var strModel = "DashboardTab";
	//console.log("====getAskAutoReflesh===")
	//console.log(jsonCondition)
	CM.crudMongo.findByMulti(jsonCondition, strModel, function(resQuery){
		//console.log(resQuery)
		if ( resQuery == false){
			logDash.debug('getAskAutoReflesh: ' + resQuery );
			res.end("false"); //not find
		}else{
			//console.log("xererxxxxxxxxxxxxxxxxxx")
			//	console.log(resQuery[0].autoRefleshAsk)
			logDash.debug('getAskAutoReflesh: ' + resQuery[0].autoRefleshAsk  );
			res.end(resQuery[0].autoRefleshAsk.toString());// true or false
		}
	});

}
/**
 * get AutoReflesh yes(true) or no(false)
 * @param  {String}
 * @param  {String}
 * @param  {Object}
 */
var getAutoReflesh = function(tab, user_mail, res)  {

	CM.crudMongo.findByMulti(jsonCondition, strModel, function(resQuery){
		if ( resQuery == false){
				logDash.debug('getAutoReflesh: ' + resQuery );
				res.end("false");
		}else{
				logDash.debug('getAutoReflesh: ' + resQuery[0].autoRefles);
				res.end(resQuery[0].autoRefles.toString());
		}
	});

}


var throwException = function()  {
	console.log("res : error");
	return "error";

}




module.exports = {
  getRunTimebyJenkins: getRunTimebyJenkins,
  getDateTimebytimeStamp : getDateTimebytimeStamp,
  getRunJobResData : getRunJobResData,
  getTaskOriginReport : getTaskOriginReport,
  getFilePathforReport : getFilePathforReport,
  savetoDashLayout : savetoDashLayout,
  saveCsstoDashLayout : saveCsstoDashLayout,
  showDashLaybyTab : showDashLaybyTab,
  saveNoShowtoDBbyDOM : saveNoShowtoDBbyDOM,
  findDashLayoutbyDOMid : findDashLayoutbyDOMid,
  removeDashLayoutbyTab : removeDashLayoutbyTab,
  getJobLog : getJobLog,
  getAskAutoReflesh : getAskAutoReflesh,
  getRunStatus : getRunStatus,
  removeDashLayoutbyDOM: removeDashLayoutbyDOM,
  isDomExisted : isDomExisted,
  getRunningOrnot : getRunningOrnot,
  throwException : throwException
}


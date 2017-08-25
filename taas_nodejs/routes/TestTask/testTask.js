/*
 *2016/04/12(George)
 *Update the calling of JenkinsJob#getRunLog
 *
 *2016/04/07(George)
 *Mark the code sections that should be rewritten to support plugin
 *
 *2016/03/04(George)
 *Support timzone-aware display
 *
 *2016/02/24(Jacky)
 *Add getSeleniumLog info
 *
 **2016/02/23(Daniel)
 *Add autogetTaskhistory for dashboard add layout dialog 
 *
 *2016/02/22(Daniel)
 *Add getTaskhistory for dashboard add layout dialog 
 *
 * 
 *2016/02/17(Daniel)
 *Add dashboardtab_task for dashboard add layout dialog list task
 *
 *
 *2016/01/30(Jacky)
 *Add example for logging function
 *
 *2016/01/29(Jacky)
 *Edit function of "editTestTask" and "updateTestTask"
 *
 *
 *2016/01/28(Jacky)
 *Save JMeter threshold values into DB
 *
 *2016/01/25(Daniel)
 *Add Jmeter function 
 *
 *
 *2016/01/24(Jacky)
 *Add test task detail
 *
 *
 * 2016/01/21(Kristen)
 * 1.Add test task edit
 * 2.Add test task delete
 *
 * 2016/01/22(Urostigma)
 * Add test task run
 *
 * 2016/01/22(emily)
 * 1.update test task add
 * 2.update test task edit
 *
 */

var Mongoose = require('mongoose');
var Project = Mongoose.model('project');
var Testtask = Mongoose.model('testtasks');
//var Statistics = Mongoose.model('statistics');
var config = require('../../config');
var exec = require('child_process').exec;
var session = require('../../lib/session.js');
var render = require('../../lib/render.js');
var proj = require('../Project/project.js');
var job = require('../../models/jenkins/job.js');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var timeLib = require('../../lib/time');
var logParser = require('../../lib/logParser.js');

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

exports.saveTesttaskInfo = function(req, res) {
	session.checkLoginbySess(req, res);

	testtask_name_os = req.body.testTask_name;
	testtask_repo_os = req.body.testTask_repo;
	testtask_test_tool = req.body.testtool;
	testtask_jmeterThreshold = req.body.Jmeterthreshod;
}

exports.getJenkinsJobLogByTabName = function(req, res) {
	var user_id = session.getSessofEmail(req);
	var dashboardtabname = req.body.tabName;
	Statistics. //Statistics
	find({
		email: user_id,
		tabname: dashboardtabname
	}).
	exec(function(err, statis) {
		Testtask. //Testtask
		find({
			proj_id: statis[0].proj_id,
		}).
		exec(function(err, tstask) {
			console.log("[tstask]" + tstask);
			if (tstask.length > 0) {
				var jobname = tstask[0].jobname;
				var jobtype = tstask[0].jobtype;
				getJenkinsJobLog(jobname, jobtype, null, function(err, result) {
					res.end(result);
				});
			} else {
				res.end("");
			}
		});
	});
}

exports.getJobLog = function(req, res) {
	var user_id = session.getSessofEmail(req);
	var dashboardtask = req.body.dashtaskname;
	var dashboardproj = req.body.dashprojname;
	Project.
	find({
		email: user_id,
		proj_name: dashboardproj
	}).
	exec(function(err, projs) {
		Testtask.
		find({
			proj_id: projs[0]._id,
			testtaskname: dashboardtask
		}).
		exec(function(err, tstask) {
			if (tstask.length > 0) {
				var jobname = tstask[0].jobname;
				var jobtype = tstask[0].jobtype;
				getJenkinsJobLog(jobname, jobtype, null, function(err, result) {
					res.end(result);
				});
			} else {
				res.end("");
			}
		});
	});
}

exports.getJenkinsJobLogById = function(req, res) {
	session.checkLoginbySess(req, res);
	Testtask.findById(req.body.TaskId, function(err, todo) {
		var jobname = todo.jobname;
		var jobtype = todo.jobtype;
		getJenkinsJobLog(jobname, jobtype, parseInt(req.body.RunNumber), function(err, result) {
			logger2.debug("result: " + result);
			if (err) return res.end(err.toString());
			else return res.end(result);
		});
	});
}

exports.statusOfTasks = function(req, res) {
    var statusJson = {};
    Testtask.findById(req.body.TaskId, function(err, todo) {
        var jobname = todo.jobname;
        var jobtype = todo.jobtype;
        var sj = JenkinsFactory.buildJobInstance(jobtype, jobname);
        sj.getRunStatus(function(err, runs) {

            if (err) callback(err);
            else if (runs.length == 0) {
                res.end('Ready');

            } else if (runs[0].number == null) {
                res.end('Waiting');
            } else if (runs[0].number != null && runs[0].result == null) {
                res.end('Running');
            } else {
                var status = runs[0].result;
                statusJson[req.body.TaskId.toString()] = status;
                res.end(status);

            }
        });
    });
}


/**
 * Check the input value is exist by taskName
 */
exports.checkTaskNameExist = function(req, res) {
	session.checkLoginbySess(req, res);
	if (req.body.taskName != "") {
		Testtask.find({
			testtaskname: req.body.taskName
		}).exec(function(err, result) {

			if (result.length > 0)
				if (req.body.taskId != result[0]._id) {
					if (result == "") {
						res.end("not exist");
					} else {
						res.end("exist");
					}
				} else {
					res.end("same with _id");
				}
			else {
				res.end("ok");
			}
		})
	} else {
		res.end("Value is null");
	}
}

/**
 * Get the Jenkins Selenium log.
 * @param {String} the Selenium job name in Jenkins.
 * @param {fn} callback receives the Selenium log. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>log: Selenium log</li>
 *   </ul>
 * @private
 */
function getJenkinsJobLog(jobName, jobType, runNumber, callback) {
	var sj = new JenkinsFactory.buildJobInstance(jobType, jobName);
	var opts = {runNumber: runNumber};
	sj.getRunLog(opts, function(err, log) {
		if (err)
			return callback(err);
		else
			return callback(err, logParser.parseLog(log));
	});
}
/*
 * Get build history by task id
 */
exports.getInfomationOfBuildHistory = function(req, res) {
    Testtask.findById(req.body.TaskId, function(err, todo) {
        var jobname = todo.jobname;
        var jobtype = todo.jobtype;
        var sj = JenkinsFactory.buildJobInstance(jobtype, jobname);
        sj.getRunStatusHistory(function(err, result) {
            if (err) {
            	res.end(err.message);
            }
            else{
            	result.forEach(function(build){
            		build.timestamp = timeLib.formatTime(build.timestamp);
            	});
            	res.json(result);
            	res.end();
            }
        });
    });
}
/*
 * Get last build information by task id
 */
exports.getLastBuildInfo = function(req, res){
	Testtask.findById(req.body.TaskId, function(err, todo) {
        var jobname = todo.jobname;
        var jobtype = todo.jobtype;
        var sj = JenkinsFactory.buildJobInstance(jobtype, jobname);
        sj.getRunStatus(function(err, result) {
            if (err) {
            	res.end(err.message);
            }
            else{
	            if (result.length == 0) {
	            } else if (result[0].number == null) {
	                result[0].status = "Waiting";
	            } else if (result[0].number != null && result[0].result == null) {
	                result[0].status = "Running";
	            } else {
	                result[0].status = result[0].result;
	            }
            	res.json(result);
            	res.end();
            }
        });
    });
}

var Mongoose = require('mongoose');
var _ = require('underscore');
var Project = Mongoose.model('project');
var Testtask = Mongoose.model('testtasks');
var session = require('../../lib/session.js');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var config = require('../../config');

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

/**
 * Copy the task to the selected project
 * @param {string} taskID
 * the ID of the task which you want to copy
 * @param {string} projID
 * the ID of the project which is the destination
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
exports.serverCopyTask = function(taskID, projID, callback) {
	Testtask.findById(taskID, function(err, task) {
		if (err) callback(err);
		// create job in Jenkins
		var jobType = task.jobtype;
		var jobOpts = task.testscript;
		JenkinsFactory.createJob(jobType, jobOpts, function(err, code, jobName) {
			if (err) {
				debugConsol('createJob err', err);
				return callback(err);
			} else {
				// create testtask
				var taskObj = reObj(task);
				var omitKey = ['_id', 'proj_id', 'jobname', 'status', 'level', 'createtime', 'updatetime'];
				var newTaskInfo = _.omit(taskObj, omitKey);
				newTaskInfo['proj_id'] = projID;
				newTaskInfo['jobname'] = jobName;
				newTaskInfo['status'] = config.taskStatus.new;
				newTaskInfo['level'] = 0;
				newTaskInfo['createtime'] = Date.now();
				newTaskInfo['updatetime'] = Date.now();
				new Testtask(newTaskInfo).save(function(err, newTask){
					if(err) return callback(null);
				});
			}
		});
	});
}


function reObj(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}
var Mongoose = require('mongoose');
var Testtask = Mongoose.model('testtasks');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var JenkinsJob = require('../../models/jenkins/job.js');
var config = require('../../config');
var render = require('../../lib/render.js');
var session = require('../../lib/session.js');
var timeLib = require('../../lib/time');
var proj = require('../Project/project.js');
var Openstack_Heat = require('../../models/openstack/HeatStack.js');
// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

/**
 * Direct to task list page.
 */
exports.tasklistByProjID = function(req, res) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);

	//Select this project
	proj.fprojSelect(req, res, function(err) {
		//Test task search
		Testtask.
		find({
			proj_id: req.params.id
		}).
		exec(function(err, tstask) {
			var jsonTstask = {
				timeLib: timeLib, // time format utility functions passed to ejs template
				tstask: tstask,
				projid: req.params.id
			};
			render.render(req, res, 'tasklist', 'Tasklist', jsonTstask);
		});
	});
}

/**
 * Direct to create task page.
 */
exports.createTestTask = function(req, res) {
	var user_id = session.getSessofEmail(req);
	var selectedProjName = session.getSessofProjectName(req);
	var selectedProjID = session.getSessofProjectID(req);
	logger2.debug(user_id + ' call createTestTask');

	session.checkLoginbySess(req, res);
	var jsonTstask = {
		projname: selectedProjName,
		projid: selectedProjID
	};

	render.render(req, res, 'addTestTask_info', 'Task Create', jsonTstask);
}

/**
 * Direct to edit task page.
 * @param {string} taskID
 * The ID of the task which you want to edit.
 */
exports.editTestTask = function(req, res) {
	var user_id = session.getSessofEmail(req);
	var selectedProjName = session.getSessofProjectName(req);
	var taskID = req.params.id;

	session.checkLoginbySess(req, res);
	logger2.debug(user_id + ' call editTestTask: taskID = ' + taskID);

	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) return callback(err);

		var jsonTestTask = {
			testTask: taskInfo,
			projname: selectedProjName
		};
		render.render(req, res, 'editTestTask_info.ejs', 'Task Edit', jsonTestTask);
	});
}

/**
 * Run the task.
 * @param {string} taskID
 * The ID of the task which you want to run.
 */
exports.runTask = function(req, res) {
	session.checkLoginbySess(req, res);

	// find task
	var taskID = req.params.id;
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) return callback(err);

		var sj = JenkinsFactory.buildJobInstance(taskInfo.jobtype, taskInfo.jobname);
		var runOpts = {};
		sj.triggerRun(runOpts, function(err, code) {
			if (err) {
				console.log('err=', err);
				taskInfo.save();
			} else if (code == JenkinsJob.JenkinsJob.TRIGGER.OK) {
				taskInfo.save();
			}
			res.redirect('/tasklistByProjID/' + taskInfo.proj_id);
		});
	});
}

/**
 * Stop the task.
 * @param {string} taskID
 * The ID of the task which you want to stop.
 */
exports.stopTask = function(req, res) {
	session.checkLoginbySess(req, res);

	// get job name
	var taskID = req.params.id;
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) {
			console.log('[stopTaskError1]' + err);
			res.redirect('/tasklist');
		} else {
			var jobName = taskInfo.jobname;
			var jobType = taskInfo.jobtype;
			// stop task
			var sj = JenkinsFactory.buildJobInstance(jobType, jobName);

			var inQueuePolling = setInterval(function() { // polling check the task is in queue or not
				sj.getRunStatus(function(err, runs) {
					//if (runs[0].inQueue == false) { // task should not in queue
					clearInterval(inQueuePolling);
					sj.cancelRun(function(err) {
						if (err) {
							console.log('[stopTaskError2]' + err);
						} else {
							taskInfo.status = config.taskStatus.failure; // update task's status in database (fail)
							taskInfo.save();
						}
						res.redirect('/tasklistByProjID/' + taskInfo.proj_id);
					});
					//}
				});
			}, 1000);
		}
	});
}

/**
 * Remove the task in database and the job in Jenkins.
 * @param {string} taskID
 * The ID of the task which you want to delete.
 */
exports.removeTestTask = function(req, res) {
	var user_id = session.getSessofEmail(req);
	var taskTitle = null;
	var taskID = req.params.id;

	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	// delete test task
	_removeTask(taskID, function(err) {
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
}

/**
 * Remove the task in the project.
 * @param {string} taskID
 * The ID of the task which you want to delete.
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
exports.funcRemoveTask = function(taskID, callback) {
	_removeTask(taskID, function(err) {
		callback(err);
	});
}

/**
 * Retrieve	the values of Database from findById, and return values to TestTaskDetail' by Jacky
 */
exports.addTestTaskDetail = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.params.id;
	_getTaskDetail(taskID, function(err, taskDetail) {
		if (err)
			res.end(err.toString());
		else
			res.end(JSON.stringify(taskDetail));
	});
}

/**
 * Remove the task in the project.
 * @param {string} taskID
 * The ID of the task which you want to remove.
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _removeTask(taskID, callback) {
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) {
			return callback(err);
		} else if (taskInfo) {
			// check the task is running?
			var taskStatus = taskInfo.status;
			if (taskStatus != config.taskStatus.run) { // not running state
				// sleep the task (fix level of tasks)
				var taskOrderJs = require('./taskOrder.js');
				taskOrderJs.funcSleepTask(taskID, function(err) {
					if (err) return callback(err);
					else {
						if (taskInfo.jobtype) {
							//remove job in openstack
							if (taskInfo.jobtype == 'deploy/generic') {
								Openstack_Heat.removeStack(taskInfo.jobname);
							}
							// remove job in Jenkins
							debugConsol('_removeTask', 'delete: ' + taskInfo.jobname);
							var sj = JenkinsFactory.buildJobInstance(taskInfo.jobtype, taskInfo.jobname);
							var delOpts = {};

							sj.delete(delOpts, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('_removeTask', 'delete success');
									// remove task in database
									taskInfo.remove(function(err, taskInfo) {
										if (err) {
											return callback(err);
										} else if (taskInfo) {
											return callback(null);
										} else
											return callback(new Error('Unexcept error'));
									});
								}
							});
						} else {
							// remove task in database
							taskInfo.remove(function(err, taskInfo) {
								if (err) {
									return callback(err);
								} else if (taskInfo) {
									return callback(null);
								} else
									return callback(new Error('Unexcept error'));
							});
						}
					}
				});
			} else {
				return callback(new Error('You can\'t remove a running task'));
			}
		} else {
			return callback(new Error('The task is not exist'));
		}
	});
}

/**
 * Get the informations of the task.
 * @param {string} taskID
 * The ID of the task whose informations you want to get.
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _getTaskDetail(taskID, callback) {
	Testtask.findById(taskID, function(err, task) {
		if (err) return callback(err, null);
		else if (task) {
			var testTaskDetail = {
				'Name': task.testtaskname,
				'Jobtype': task.jobtype
			};
			var testScript = task.testscript;
			var _ = require('underscore');
			_.extend(testTaskDetail, testScript);
			return callback(null, testTaskDetail);
		} else {
			return callback(new Error('Task not found.'), null);
		}

	})
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}
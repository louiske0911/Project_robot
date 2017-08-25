var Mongoose = require('mongoose');
var urlencode = require('urlencode');
var Testtask = Mongoose.model('testtasks');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var config = require('../../config');
var render = require('../../lib/render.js');
var session = require('../../lib/session.js');
var JenkinsJob = require('../../models/jenkins/job.js');

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

/**
 * Return the task form for editing
 */
exports.loadEditTaskForm = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) res.end('Find test task error!');
		else {
			debugConsol('taskInfo', taskInfo);
			var jobType = taskInfo.jobtype;
			var jobClass = JenkinsFactory.getJobClass(jobType);
			debugConsol('jobClass', jobClass);
			var jobDescript = jobClass.getUpdateOptionsDescriptor();
			res.end(JSON.stringify(jobDescript));
		}
	});
}

/**
 * Return the informations of the task.
 */
exports.getTaskInfo = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) res.end('Find test task error!');
		else {
			res.end(JSON.stringify(taskInfo));
		}
	});
}

/**
 * Edit and update the task in database.
 */
exports.updateTestTask = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	// check task name in the project is repeat or not
	var projID = req.body.projID;
	var taskID = req.body.taskID;
	Testtask.find({
		testtaskname: keyInSS(req.body.testForm, 'taskName'),
		proj_id: projID,
		_id: {'$ne':taskID }
	}, function(err, tasks) {
		if (err) res.end(err.toString());
		else if (tasks.length > 0) {
			// repeat name
			res.end('repeat name');
			return;
		} else {
			// update
			var jobType = req.body.jobType;
			var testForm = req.body.testForm;
			var taskJs = require('./task.js');
			var jobOpts = taskJs.funcGetJobOpts(jobType, testForm);
			jobOpts.projID = projID;

			Testtask.findById(taskID, function(err, taskInfo) {
				if (err) res.end('Find test task error!');
				else {
					var job = JenkinsFactory.buildJobInstance(jobType, taskInfo.jobname);
					// Jenkins update
					job.update(jobOpts, function(err, code) {
						if (err) res.end('Update error!');
						else {
							debugConsol('code', code);
							// database update
							taskInfo.testtaskname = keyInSS(testForm, 'taskName');
							taskInfo.testscript = jobOpts;
							taskInfo.updatetime = Date.now();
							taskInfo.save();
							res.end('success');
						}
					});
				}
			});
		}
	});
}

function keyInSS(str, key) {
	var value = '';
	var index = str.search(key + "=");
	index += key.length + 1; // one char is '='
	while (index < str.length) {
		if (str[index] == '&') break;
		if (str[index] == '+') value += ' '; // space character
		else value += str[index];
		++index;
	}
	return urlencode.decode(value);
}

function getStringFromSS(testForm, descriptor) {
	return keyInSS(testForm, descriptor.name);
}

function getOptionFromSS(testForm, descriptor) {
	if (descriptor.multiple == true) { // multiple answer
		var optionSet = new Array();
		var options = descriptor.options;
		options.forEach(function(option) {
			if (testForm.search(option.displayName) != -1) { // option's name in testForm means the option is choosed
				optionSet.push(option.value);
			}
		});
		debugConsol('optionSet', optionSet);
		return optionSet;
	} else { // single answer
		return parseInt(keyInSS(testForm, descriptor.name)); // string to int
	}
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}
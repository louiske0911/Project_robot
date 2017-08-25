var Mongoose = require('mongoose');
var urlencode = require('urlencode');
var util = require('util');
var Testtask = Mongoose.model('testtasks');
var Project = Mongoose.model('project');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var config = require('../../config');
var session = require('../../lib/session.js');
var JenkinsJob = require('../../models/jenkins/job.js');

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

exports.getTaskTypes = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var typeList = new Array();
	var allPlugins;
	allPlugins = _getAllPlugins();
	allPlugins.forEach(function(element) {
		typeList.push(element.type);
	});

	res.end(JSON.stringify(typeList));
};

exports.loadAddTaskForm = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskType = req.body.taskType;
	var jobClass = JenkinsFactory.getJobClass(taskType);
	var jobDescript = jobClass.getCreateOptionsDescriptor();
	res.end(JSON.stringify(jobDescript));
};

exports.buildJobInstance = function(jobType, jobName) {
	var job = JenkinsFactory.buildJobInstance(jobType, jobName);
	return job;
};

/**
 * Create a task in database and a job in Jenkins.
 * @param {string} projID
 * The ID of the project where the task create
 * @param {string} jobType
 * The type of the created task
 * @param {string} testForm
 * The serilize string made from the HTML form
 */
exports.addTesttask = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		return res.end('verify error');
	}

	// check task name in the project is repeat or not
	var userMail = session.getSessofEmail(req);
	var projID = req.body.projID;
	var jobType = req.body.jobType;
	var testForm = req.body.testForm;
	logger2.debug(
		util.format('addTesttask: projID=%s, jobType=%s, testForm=%s',
			projID, jobType, testForm));

	_addTask(userMail, projID, jobType, testForm, function(err) {
		if (err) return res.end(err.toString());
		else return res.end('success');
	});
}

exports.funcGetJobOpts = function(jobType, testForm){
	return _getJobOpts(jobType, testForm);
}

/**
 * Return all of the available plugins.
 * @returns {Array} all of the available plugins
 * @private
 */
function _getAllPlugins() {
	var pluginsList = JenkinsFactory.getAllPlugins();
	return pluginsList;
};

/**
 * Parse the (form's) serialized string to JSON style.
 * @param {String} jobtype
 * The job's type.
 * @param {String} testForm
 * The (form's) serialized string.
 * @returns {Object} The JSON object includes form's informations.
 * @private
 */
function _getJobOpts(jobType, testForm) {
	debugConsol('testForm', testForm);
	var jobOpts = {}; // object
	// job descriptor
	var jobClass = JenkinsFactory.getJobClass(jobType);
	var jobDescript = jobClass.getCreateOptionsDescriptor();
	// 
	function getJobOptsFromForm(descriptor) {
		////debugConsol('descriptor', descriptor);
		switch (descriptor.type) {
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.NUMBER:
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.DECIMAL:
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.STRING:
				jobOpts[descriptor.name] = getStringFromSS(testForm, descriptor);
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.PASSWORD:
				jobOpts[descriptor.name] = getStringFromSS(testForm, descriptor);
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.OPTION:
				jobOpts[descriptor.name] = getOptionFromSS(testForm, descriptor);
				if(descriptor.childs){
					descriptor.childs[jobOpts[descriptor.name]].forEach(getJobOptsFromForm);
				}
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.URL:
				jobOpts[descriptor.name] = getStringFromSS(testForm, descriptor);
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.PATH:
				jobOpts[descriptor.name] = getStringFromSS(testForm, descriptor);
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.EMAIL:
				jobOpts[descriptor.name] = getStringFromSS(testForm, descriptor);
				break;
			case JenkinsJob.JenkinsJob.DESCRIPTOR_TYPE.PARENTDIV:
				descriptor.childs.forEach(getJobOptsFromForm);
				break;
			default:
				break;
		}
	}
	jobDescript.forEach(getJobOptsFromForm);
	debugConsol('jobOpts', jobOpts);
	return jobOpts;
}

/**
 * Add a task in database with the given testForm.
 * @param {string} userMail
 * the ID of the task owner
 * @param {string} projID
 * the ID of the project where the task create
 * @param {string} jobType
 * the type of the created task
 * @param {string} testForm
 * the serilize string made from the HTML form
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _addTask(userMail, projID, jobType, testForm, callback) {
	Testtask.find({
		testtaskname: _keyInSS(testForm, 'taskName'),
		proj_id: projID
	}, function(err, tasks) {
		if (err) callback(err);
		else if (tasks.length > 0) {
			// repeat name
			callback(new Error('repeat name'));
			return;
		} else {
			// create job in Jenkins
			var jobOpts = _getJobOpts(jobType, testForm);
			jobOpts.projID = projID;
			
			JenkinsFactory.createJob(jobType, jobOpts, function(err, code, jobName) {
				if (err) {
					debugConsol('createJob err', err);
					callback(err);
				} else {
					// create testtask
					var jobOptsForDB = _getJobOpts(jobType, testForm);
					var testtask = new Testtask({
						email: userMail,
						proj_id: projID,
						testtaskname: _keyInSS(testForm, 'taskName'),
						jobtype: jobType,
						jobname: jobName,
						testscript: jobOptsForDB,
						status: config.taskStatus.new,
						isnotifyed: true,
						createtime: Date.now(),
						updatetime: Date.now()
					});

					// save testtask
					testtask.save(function(err) {
						if (err) {
							debugConsol('task save err', err);
							callback(err);
						} else {
							callback(null); // success
						}
					});
				}
			});
		}
	});
};

/**
 * Return the value of the key in the serialized string
 * @param {String} str
 * serialized string
 * @param {String} key
 * key name
 * @returns {String} the value of the key in the serialized string
 * @private
 */
function _keyInSS(str, key) {
	var value = '';
	var index = str.search(key + "=");
	if(index == -1){
		return "";
	}
	index += key.length + 1; // one char is '='
	while (index < str.length) {
		if (str[index] == '&') break;
		if (str[index] == '+') value += ' '; // space character
		else value += str[index];
		++index;
	}
	return urlencode.decode(value);
}

/**
 * Find out the string value with the given descriptor from the serialized string
 * @param {String} testForm
 * serialized string
 * @param {Object} descriptor
 * descriptor object
 * @returns {String}
 * @private
 */
function getStringFromSS(testForm, descriptor) {
	return _keyInSS(testForm, descriptor.name);
}

/**
 * Find out the option value with the given descriptor from the serialized string
 * @param {String} testForm
 * serialized string
 * @param {Object} descriptor
 * descriptor object
 * @returns {String}
 * @private
 */
function getOptionFromSS(testForm, descriptor) {
	if (descriptor.multiple == true) { // multiple answer
		var optionSet = new Array();
		var options = descriptor.options;
		options.forEach(function(option) {
			if (testForm.search(option.name) != -1) { // option's name in testForm means the option is choosed
				optionSet.push(option.value);
			}
		});
		debugConsol('optionSet', optionSet);
		return optionSet;
	} else { // single answer
		return parseInt(_keyInSS(testForm, descriptor.name)); // string to int
	}
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}

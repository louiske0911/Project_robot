var async = require('async');
var Mongoose = require('mongoose');
var _ = require('underscore');
var Project = Mongoose.model('project');
var Testtask = Mongoose.model('testtasks');
var session = require('../../lib/session.js');
var render = require('../../lib/render.js');
var config = require('../../config');
var timeLib = require('../../lib/time');
var urlencode = require('urlencode');
var JenkinsJob = require('../../models/jenkins/job.js');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

/**
 * Direct to project list page.
 */
exports.projectList = function(req, res) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);
	logger2.debug(user_id + ' call projectCreate');

	Project.
	find({
		email: user_id
	}).
	exec(function(err, projs) {
		var jsonTsprojs = {
			timeLib: timeLib, // time format utility functions passed to ejs template
			projs: projs
		};
		render.render(req, res, 'projectlist', 'Project Management', jsonTsprojs);
	});
}

/**
 * Direct to project create page. (Not include creating a project to database)
 */
exports.projectCreate = function(req, res) {
	session.checkLoginbySess(req, res);
	logger2.debug(user_id + ' call projectCreate');

	var user_id = session.getSessofEmail(req);
	var projArr = new Array();
	var projItemArr = null;
	Testtask.
	find({
		$and: [{
			$or: [{
				email: user_id
			}]
		}, {
			jobtype: new RegExp(/test\/.*/)
		}]
	}).
	exec(function(err, tstask) {
		async.each(tstask, function(taskInfo, callback){
			Project.findById(taskInfo.proj_id, function(err, proj) {
				if (err) return callback(err);
				if (proj != null) {
					projItemArr = new Array(2);
					projItemArr[0] = taskInfo.proj_id;
					projItemArr[1] = proj.proj_name;
					projArr.push(projItemArr);
					console.log("proj_id=" + taskInfo.proj_id + ",projName=" + proj.proj_name);
					callback();
				}else{
					callback(new Error('project not found'));
				}
			});
		}, function(err){
			var jsonTstask = {
				timeLib: timeLib, // time format utility functions passed to ejs template
				tstask: tstask,
				projnameArr: projArr
			};
			render.render(req, res, 'projectcreate', 'Project Create', jsonTstask);
		});
	});
}

/**
 * Direct to project edit page. (Not include editing a project to database)
 */
exports.projectEdit = function(req, res, callback) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);
	logger2.debug(user_id + ' call projectEdit');

	Project.findById(req.params.id, function(err, proj) {
		if (err) return callback(err);
		var jsonProj = {
			proj: proj
		};
		render.render(req, res, 'projectedit', 'Project Edit', jsonProj);
	});
}

/**
 * Edit a project and update it.
 */
exports.fProjEdit = function(req, res, callback) {
	var user_id = session.getSessofEmail(req);
	var projname = req.body.projName;

	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	logger2.info(user_id + ' edit project: proj_id = ' + req.params.id);

	var now = new Date();

	Project.find({
		email: user_id,
		proj_name: projname
	}).exec(function(err, projs) {
		if (projs.length > 0) {
			if (req.params.id == projs[0]._id) {
				Project.findById(req.params.id, function(err, proj) {
					proj.proj_name = req.body.projName;
					proj.proj_description = req.body.projDesc;
					proj.updatetime = now;
					proj.save(function(err, proj) {
						if (err) return callback(err);

						res.end('success');
					});
				});
			} else {
				res.end('same');
			}
		} else {
			Project.findById(req.params.id, function(err, proj) {
				proj.proj_name = req.body.projName;
				proj.proj_description = req.body.projDesc;
				proj.updatetime = now;
				proj.save(function(err, proj) {
					if (err) return callback(err);

					res.end('success');
				});
			});
		}
	});
}

/**
 * Destory a project. The tasks which are under the project alse have to remove. 
 */
exports.fProjDestroy = function(req, res) {
	var user_id = session.getSessofEmail(req);
	var selectedProjID = session.getSessofProjectID(req);
	var delProjID = req.params.id;

	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	logger2.info(user_id + ' destory a project: proj_id = ' + delProjID);

	Project.findById(delProjID, function(err, proj) {
		if (err) {
			res.end(err.toString());
		} else if (proj) {
			//if the destroy one is same as the current select one
			if (delProjID == selectedProjID)
				session.setSessbyProjectID(req, '');

			//the tasks which are in the project have to delete
			var taskListJs = require('../TestTask/taskList.js');
			Testtask.find({
				proj_id: delProjID
			}, function(err, tasks) {
				async.eachSeries(tasks, function(task, callback) {
					taskListJs.funcRemoveTask(task._id, function(err) {
						if (err) {
							callback(err);
						} else {
							debugConsol('fProjDestroy', 'funcRemoveTask ' + task._id + 'success');
							callback(null);
						}
					});
				}, function(err) {
					if (err) res.end(err.toString());
					else {
						//remove the project
						proj.remove(function(err, proj) {
							if (err)
								res.end(err.toString());
							else
								res.end('success');
						});
					}
				});
			});
		} else {
			console.log('[fProjDestroy] The project is not exist.');
			res.end('The project is not exist.');
		}
	});
}

/**
 * Use session to record which project is latest selected.
 */
exports.fprojSelect = function(req, res, callback) {
	var user_id = session.getSessofEmail(req);
	var projID = req.params.id;

	session.checkLoginbySess(req, res);
	logger2.info(user_id + ' select the project: proj_id = ' + projID);

	Project.findById(projID, function(err, proj) {
		if (err) return res.end(err.toString());

		session.setSessbyProjectID(req, projID);
		session.setSessbyProjectName(req, proj.proj_name);
		return callback(null);
	});
}

exports.dashboardtab_proj = function(req, res) {
	var user_id = session.getSessofEmail(req);

	session.checkLoginbySess(req, res);

	Project.
	find({
		email: user_id
	}).
	exec(function(err, projs) {
		var jsonTsprojs = {
			projs: projs
		};
		render.render(req, res, 'dashboard', 'dialog Report', jsonTsprojs);
	});
}

/**
 * Get the status of the project and return it.
 */
exports.getProjectStatus = function(req, res) {
	if (session.checkLoginbySessBool(req)) {
		//Test task search
		var projID = req.params.id;
		Testtask.find({
			proj_id: projID
		}).exec(function(err, tstasks) {
			if (err)
				res.end('error' + projID);
			else {
				tstasks.forEach(function(task, index) {
					if (task.status == config.taskStatus.run)
						res.end('run');
				});
				res.end('done');
			}
		});
	} else
		res.end('verify error');
}

exports.copyProject = function(req, res) {
	if (session.checkLoginbySessBool(req)) {
		//Test task search
		var projID = req.body.projID;
		var copyName = req.body.copyName;

		_copyProject(projID, copyName, function(err) {
			if (err) res.end(err.toString());
			else res.end('success');
		});
	} else
		res.end('verify error');
}

exports.buildnewproject = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var user_id = session.getSessofEmail(req);
	var Buildproj = req.body.Buildproj;
	var Deployproj = req.body.Deployproj;
	var CopyTask = req.body.CopyTask;
	var projname = req.body.projname;
	var projSvm = req.body.projSvm;
	var projUrl = req.body.projUrl;
	var projBranch = req.body.projBranch;
	var projUsername = req.body.projUsername;
	var projPassword = req.body.projPassword;
	var projSsh = req.body.projSsh;
	var BuildPlugin = req.body.BuildPlugin;
	var DeployCfg = req.body.DeployCfg;
	var Buildval = req.body.Buildval;
	var Deployval = req.body.Deployval;
	var Scmval = req.body.Scmval;
	var tid = req.body.taskid;
	var projDesc = req.body.projDesc;
	var projDBObj = null;
	var projID = null;

	debugConsol('buildnewproject', 'buildnewproject');
	async.series([
		// === check existence of project name ===
		function(callback){
			Project.find({
				email: user_id,
				proj_name: projname
			}).exec(function(err, projs) {
				if (projs.length > 0) {
					return callback(new Error('Project name repeats'));
				} else {
					return callback();
				}
			});
		},

		// === save project to DB & copy tasks from existing projects ===
		function(callback) {
			new Project({
				email: user_id,
				proj_name: projname,
				proj_description: projDesc
			}).save(function(err, proj, numAffected) {
				if (err) return callback(err);
				projDBObj = proj;  // will be referenced by following steps
				projID = projDBObj._id;

				if (CopyTask == "CopyTask" && tid != null) {
					let taskCopyJs = require('../TestTask/taskCopy.js');

					tid.forEach(function(tid) {
						Testtask.find({
							email: user_id,
							_id: tid
						}, function(err, tasksInfo) {
							taskCopyJs.serverCopyTask(tasksInfo[0]._id, projDBObj._id, function(err) {
								if (err) return callback(err);
							});
						});
					});
				}
				return callback();
			});
		},

		// === create SCM tasks ===
		function(callback) {
			// svn task
			if (projSvm == "Please select a task type" || projUrl == "" || projBranch == "") {
				return callback(null);
			}
			else if (projSvm == "scm/svn") {
				var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
				var jobSvnType = "scm/svn";
				var jobSvnOpts = _getJobOpts(jobSvnType, projID, Scmval);

				JenkinsFactory.createJob(jobSvnType, jobSvnOpts, function(err, code, jobName) {
					if (err) return callback(err);
					debugConsol('projectBuildDeploytask', 'createJob svn success');

					new Testtask({
						email: user_id,
						proj_id: projID,
						status: 0,
						testtaskname: "Svn",
						jobtype: jobSvnType,
						jobname: jobName,
						testscript: jobSvnOpts,
						status: config.taskStatus.new,
						isnotifyed: true,
						createtime: Date.now(),
						updatetime: Date.now()
					}).save(function(err, task) {
						if (err) return callback(err);
						else {
							// add to pipeline
							orderJs = require('../TestTask/taskOrder.js');
							orderJs.funcWakeTask(task._id, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('projectBuildDeploytask', 'svm wake up');
									return callback(null);
								}
							});
						}
					});
				});
			}
			// git task
			else if (projSvm == "scm/git") {
				var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
				var jobType = "scm/git";
				var jobOpts = _getJobOpts(jobType, projID, Scmval);

				JenkinsFactory.createJob(jobType, jobOpts, function(err, code, jobName) {
					if (err) return callback(err);
					debugConsol('projectBuildDeploytask', 'createJob git success');

					new Testtask({
						email: user_id,
						proj_id: projID,
						status: 0,
						testtaskname: "Git",
						jobtype: jobType,
						jobname: jobName,
						testscript: jobOpts,
						status: config.taskStatus.new,
						isnotifyed: true,
						createtime: Date.now(),
						updatetime: Date.now()
					}).save(function(err, task) {
						if (err) return callback(err);
						else {
							// add to pipeline
							orderJs = require('../TestTask/taskOrder.js');
							orderJs.funcWakeTask(task._id, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('projectBuildDeploytask', 'git wake up');
									return callback(null);
								}
							});
						}
					});
				});
			} else {
				return callback(null);
			}
		},

		// === create build task ===
		function(callback) {
			if (Buildproj == "Buildproj") {
				var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
				var jobBuildType = "build/generic";
				var jobBuildOpts = _getJobOpts(jobBuildType, projID, Buildval);

				JenkinsFactory.createJob(jobBuildType, jobBuildOpts, function(err, code, jobName) {
					if (err) return callback(err);
					debugConsol('projectBuildDeploytask', 'createJob build success');

					new Testtask({
						email: user_id,
						proj_id: projID,
						status: 0,
						testtaskname: "Build",
						jobtype: jobBuildType,
						jobname: jobName,
						testscript: jobBuildOpts,
						status: config.taskStatus.new,
						isnotifyed: true,
						createtime: Date.now(),
						updatetime: Date.now()
					}).save(function(err, task) {
						if (err) return callback(err);
						else {
							// add to pipeline
							orderJs = require('../TestTask/taskOrder.js');
							orderJs.funcWakeTask(task._id, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('projectBuildDeploytask', 'build wake up');
									return callback(null);
								}
							});
						}
					});
				});
			} else {
				return callback(null);
			}
		},

		// == create deployment task ===
		function(callback) {
			if (Deployproj == "Deployproj") {
				var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
				var jobDeployType = "deploy/generic";
				var jobDeployOpts = _getJobOpts(jobDeployType, projID, Deployval);

				JenkinsFactory.createJob(jobDeployType, jobDeployOpts, function(err, code, jobName) {
					if (err) return callback(err);
					debugConsol('projectBuildDeploytask', 'createJob deploy success');

					new Testtask({
						email: user_id,
						proj_id: projID,
						status: 0,
						testtaskname: "Deploy",
						jobtype: jobDeployType,
						jobname: jobName,
						testscript: jobDeployOpts,
						status: config.taskStatus.new,
						isnotifyed: true,
						createtime: Date.now(),
						updatetime: Date.now()
					}).save(function(err, task) {
						if (err) return callback(err);
						else {
							// add to pipeline
							orderJs = require('../TestTask/taskOrder.js');
							orderJs.funcWakeTask(task._id, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('projectBuildDeploytask', 'deploy wake up');
									return callback(null);
								}
							});
						}
					});
				});
			} else {
				return callback(null);
			}
		}

		// === result/error handling ===
	], function(err) {
		if (err) res.end(err.toString());
		else res.end();
	});
}

function _getJobOpts(jobType, projID, testForm) {
	debugConsol('testForm', testForm);
	var jobOpts = {};
	var jobClass = JenkinsFactory.getJobClass(jobType);
	var jobDescript = jobClass.getCreateOptionsDescriptor();

	jobOpts.projID = projID;

	jobDescript.forEach(function(descriptor) {
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
			default:
				break;
		}

	});
	debugConsol('jobOpts', jobOpts);
	return jobOpts;
}


function _keyInSS(str, key) {
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
	return _keyInSS(testForm, descriptor.name);
}

/**
 * copy the project and the tasks in the project
 * @param {string} projID
 * the ID of the project which you want to copy
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _copyProject(projID, copyName, callback) {
	// check the name is repeat or not
	Project.find({
		proj_name: copyName
	}, function(err, projs) {
		if (err) return callback(err);
		else if (projs.length > 0) {
			// there is a project's name as same as the copy name
			return callback(new Error('repeat name'));
		} else {
			// create a new project 
			Project.findById(projID, function(err, proj) {
				var projObj = reObj(proj);
				var omitKey = ['_id', 'createtime', 'updatetime', 'pipelinename'];
				var projInfo = _.omit(projObj, omitKey);
				projInfo['proj_name'] = copyName;
				new Project(projInfo).save(function(err, newProj) {
					if (err) {
						debugConsol('_copyProject err', err);
						return callback(err);
					} else {
						// copy all the tasks in the project
						var taskCopyJs = require('../TestTask/taskCopy.js');
						Testtask.find({
							proj_id: projID
						}, function(err, tasksInfo) {
							tasksInfo.forEach(function(taskInfo) {
								taskCopyJs.serverCopyTask(taskInfo._id, newProj._id, function(err) {
									if (err) return callback(err);
								});
							});
							return callback(null);
						});
					}
				});
			});
		}
	});
}

/**
 * regularize the object to JSON format
 * @param {object} obj
 * the object which you want to regularize
 * @private
 */
function reObj(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}

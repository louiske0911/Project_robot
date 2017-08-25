var Mongoose = require('mongoose');
var async = require('async');
var Testtask = Mongoose.model('testtasks');
var Project = Mongoose.model('project');
var taskOrderJs = require('./taskOrder.js');
var session = require('../../lib/session.js');
var pipeline = require('../../models/jenkins/pipeline.js');

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level

/**
 * Execute pipeline
 */
exports.pipeline = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var projID = req.body.projID;
	_pipeline(projID, function(err) {
		if (err) res.end(JSON.stringify(err));
		res.end('pipeline');
	});
}

/**
 * remove the pipeline in the project
 * @param {string} projID
 * the ID of the project whose pipeline you want to remove
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
exports.funcRemovePipeline = function(projID, callback) {
	_removePipeline(projID, function(err) {
		callback(err);
	});
}

/**
 * update the pipeline in the project
 * @param {string} projID
 * the ID of the project whose pipeline you want to update
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
exports.funcUpdatePipeline = function(projID, callback) {
	_updatePipeline(projID, function(err) {
		callback(err);
	});
}

/**
 * execute the pipeline in the project
 * @param {string} projID
 * the ID of the project whose pipeline you want to execute
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _pipeline(projID, callback) {
	// get pipeline Array
	taskOrderJs.funcGetMaxOrder(projID, function(err, maxOrder) {
		if (err) return callback(err);
		else if (maxOrder == -1) {
			return callback(new Error('funcGetMaxOrder error'));
		} else if (maxOrder == 0) {
			return callback(null); // all tasks in project are sleep or there is no task in project
		} else {
			var pipelineArray = new Array(maxOrder); // the length of the array is 'maxOrder'
			Testtask.find({
				proj_id: projID
			}, function(err, tasks) {
				if (err) return callback(err);
				else {
					async.eachSeries(tasks, function(task, callback) {
						if (task.level > 0) {
							pipelineArray[task.level - 1] = task.jobname;
						}
						callback();
					}, function() {
						Project.findById(projID, function(err, proj) {
							if (err) return callback(err);

							if (proj.pipelinename == '') {
								// no pipeline in Jenkins
								return callback(new Error('no pipeline in Jenkins'));
							} else {
								// execute pipeline in Jenkins
								var pipelineName = proj.pipelinename;
								var jenkinsPipeline = new pipeline.JenkinsPipeline(pipelineName);

								jenkinsPipeline.triggerRun({}, function(err, code) { // empty opts
									if (err) return callback(err);
								});
							}
						});
					});
				}
			});
		}
	});
	return callback(null);
}

/**
 * remove the pipeline in the project
 * @param {string} projID
 * the ID of the project whose pipeline you want to remove
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _removePipeline(projID, callback) {
	Project.findById(projID, function(err, proj) {
		var pipelineName = proj.pipelinename;
		var jenkinsPipeline = new pipeline.JenkinsPipeline(pipelineName);

		if (pipelineName != '') {
			jenkinsPipeline.delete({}, function(err) { // empty opts
				if (err) return callback(err);
				else {
					// update database info
					proj.pipelinename = '';
					proj.save(function(err, doc, numAffected) {
						if (err) return callback(err);
						return callback(null);
					});
				}
			});
		} else {
			// no pipeline created in Jenkins with the project
			return callback(null);
		}
	});
}

/**
 * update the pipeline in the project
 * @param {string} projID
 * the ID of the project whose pipeline you want to update
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 * @private
 */
function _updatePipeline(projID, callback) {
	debugConsol('_updatePipeline', 'projID: ' + projID);
	Project.findById(projID, function(err, proj) {
		var pipelineName = proj.pipelinename;
		var jenkinsPipeline = new pipeline.JenkinsPipeline(pipelineName);

		taskOrderJs.funcGetMaxOrder(projID, function(err, maxOrder) {
			if (err) return callback(err);
			else if (maxOrder == -1) {
				return callback(new Error('funcGetMaxOrder error'));
			} else if (maxOrder == 0) {
				debugConsol('_updatePipeline', 'all tasks in project are sleep or there is no task in project');
				_removePipeline(projID, function(err) {
					if (err) return callback(err);
					else return callback(null);
				});
			} else {
				var pipelineArray = new Array(maxOrder); // the length of the array is 'maxOrder'
				var continueDownstreamOnFailure = [];
				Testtask.find({
					proj_id: projID
				}, function(err, tasks) {
					if (err) return callback(err);
					else {
						async.eachSeries(tasks, function(task, callback) {
							if (task.level > 0) {
								pipelineArray[task.level - 1] = task.jobname;
								if (task.contdownstream) {
									continueDownstreamOnFailure.push(task.jobname);
								}
							}
							return callback();
						}, function() {
							debugConsol('_updatePipeline', 'pipelineArray: ' + pipelineArray + '\npipelineName: ' + pipelineName + '\ncontinueDownstreamOnFailure: ' + continueDownstreamOnFailure);
							if (pipelineName != '') {
								// update existing pipeline in Jenkins
								jenkinsPipeline.update(pipelineArray, continueDownstreamOnFailure, function(err, pipelineName) {
									if (err) return callback(err);
									else {
										// update pipeline name in database
										proj.pipelinename = pipelineName;
										proj.save(function(err, doc, numAffected) {
											if (err) return callback(err);
											debugConsol('_updatePipeline', 'update success');
											return callback(null);
										});
									}
								});
							} else {
								// create pipeline
								pipeline.JenkinsPipeline.create(pipelineArray, continueDownstreamOnFailure, function(err, pipelineName) {
									if (err) return callback(err);
									else {
										// update pipeline name in database
										proj.pipelinename = pipelineName;
										proj.save(function(err, doc, numAffected) {
											if (err) return callback(err);
											debugConsol('_updatePipeline', 'create success');
											return callback(null);
										});
									}
								});
							}
						});
					}
				});
			}
		});
	});
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}

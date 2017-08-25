var Mongoose = require('mongoose');
var async = require('async');
var Testtask = Mongoose.model('testtasks');
var Project = Mongoose.model('project');
var session = require('../../lib/session.js');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var pipeline = require('../../models/jenkins/pipeline.js');

exports.statusLightOfTasks = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}
	
	var projID = req.body.projID;
	_statusLightOfTasks(projID, function(err, result) {
		if (err) res.end(err.toString());
		else res.end(JSON.stringify(result));
	});
}

/**
 * Receive all status of the tasks in chosen project.
 * @param {string} projID
 * The ID of the project
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 *   <li>statusJson (object): status object</li>
 * </ul>
 * @private
 */
function _statusLightOfTasks(projID, callback) {
	var statusJson = {};
	Testtask.find({
		proj_id: projID
	}, function(err, tasks) {
		if (err) return callback(err, null);
		else {
			async.each(tasks, function(task, callback) {
				if (task['jobtype']) { 
					var sj = JenkinsFactory.buildJobInstance(task['jobtype'], task['jobname']);
					sj.getRunStatus(function(err, runs) {
						if (err) callback(err);
						else if (runs.length == 0) {
							statusJson[task._id.toString()] = 'READY';
							callback();
						} else {
							var status = runs[0].result;
							statusJson[task._id.toString()] = status;
							callback();
						}
					});
				} else {
					statusJson[task._id.toString()] = 'READY';
					callback();
				}
			}, function(err) {
				if (err) return callback(err, null);
				else {
					return callback(null, statusJson);
				}
			});
		}
	});
}
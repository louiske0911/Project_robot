var Mongoose = require('mongoose');
var async = require('async');
var Testtask = Mongoose.model('testtasks');
var Project = Mongoose.model('project');
var session = require('../../lib/session.js');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var pipeline = require('../../models/jenkins/pipeline.js');

exports.statusLightOfProject = function(req, res) {
	var projID = req.body.projID;
	_statusLightOfProject(projID, function(err, result) {
		if (err) res.end(JSON.stringify(err));
		else res.end(result);
	});
}

function _statusLightOfProject(projID, callback) {
	var isTaskRunning = false;
	Testtask.find({
		proj_id: projID
	}, function(err, tasks) {
		if (err) return callback(err, null);
		else {
			async.each(tasks, function(task, callback) {
				if (task['jobtype']) { //for test
					var sj = JenkinsFactory.buildJobInstance(task['jobtype'], task['jobname']);
					sj.getRunStatus(function(err, runs) {
						if (err) return callback(err);
						else if (runs.length == 0) { // ready state
							return callback();
						} else {
							var status = runs[0].result;
							if (status == null) isTaskRunning = true;
							return callback();
						}
					});
				} else {
					return callback();
				}
			}, function(err) {
				if (err) return callback(err, null);
				else {
					if (isTaskRunning) return callback(null, 'RUNNING');
					else return callback(null, 'DONE');
				}
			});
		}
	});
}

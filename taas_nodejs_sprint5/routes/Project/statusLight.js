var Mongoose = require('mongoose');
var async = require('async');
var Testtask = Mongoose.model('testtasks');
var Project = Mongoose.model('project');
var session = require('../../lib/session.js');
var JenkinsFactory = require('../../models/jenkins/factory').JenkinsFactory;
var pipeline = require('../../models/jenkins/pipeline.js');

exports.statusLightOfProject = function(req, res) {
	var projID = req.body.projID;
	var user_id = session.getSessofEmail(req);

	_statusLightOfProject(projID, function(err, result) {
		if (err) res.end(JSON.stringify(err));
		else {
			getProjPermission(projID, user_id, function(err, permission){
                // send access right along with status light. by Tony
                var jsonResult = {
                    result: result,
                    editprojectuser: permission.editprojectuser, // access right
                };
                res.end(JSON.stringify(jsonResult));
		    });
		}
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

/*
Get the permission setting of the project. Tony 2017.7.28
*/
function getProjPermission(proj_id, user_id, callback) {
    Project.findById(proj_id, function(err, proj) {

        if (proj.email == user_id) {
            // user is the project creator
            var jsonPerm = {
            editprojectuser: 1,
	        edittasks: 1,
	        runtasks: 1
	        };
        } else {
            // user share the project
            let index = proj.proj_share.indexOf(user_id);
            var jsonPerm = {
                editprojectuser: proj.permission[index][0],
                edittasks: proj.permission[index][1],
                runtasks: proj.permission[index][2]
            };
        }
        return callback(null,jsonPerm);
	});
}
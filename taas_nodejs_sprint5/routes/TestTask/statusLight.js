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
	var user_id = session.getSessofEmail(req);
	_statusLightOfTasks(projID, function(err, result) {
		if (err) res.end(err.toString());
		else {
			getProjPermission(projID, user_id, function(err, permission){
                // send access right along with status light. by Tony
                var jsonResult = {
                    result: result,
                    edittasks: permission.edittasks, // access right
                    runtasks: permission.runtasks // access right
                };
                res.end(JSON.stringify(jsonResult));
		    });
		}
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
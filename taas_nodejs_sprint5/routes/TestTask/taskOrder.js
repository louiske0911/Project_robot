var Mongoose = require('mongoose');
var Project = Mongoose.model('project');
var Testtask = Mongoose.model('testtasks');
var async = require('async');
var session = require('../../lib/session.js');
var pipelineJs = require('./taskPipeline.js');

// set logging
var logging = require('../../lib/logging'); //require logger module
logger2 = logging.log_routes('Routes'); // Set up Category
logger2.setLevel('all'); //set logger level


exports.getTasksOrder = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var projID = req.body.projID;
	_getTasksOrder(projID, function(err, tasksOrder) {
		debugConsol('err', err);
		debugConsol('tasksOrder', tasksOrder);
		res.end(JSON.stringify(tasksOrder));
	});
}

exports.wakeTask = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	_wakeTask(taskID, function(err) {
		debugConsol('err', err);
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
}

exports.sleepTask = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	_sleepTask(taskID, function(err) {
		debugConsol('err', err);
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
}

exports.upOrderTask = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	_upOrderTask(taskID, function(err) {
		debugConsol('err', err);
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
}

exports.downOrderTask = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	_downOrderTask(taskID, function(err) {
		debugConsol('err', err);
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
}

/**
 * Enable or disable pipeline continuation when parent job fails
 */
exports.enableContDownstream = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var taskID = req.body.taskID;
	var continueDownstreamOnFailure = (req.body.enable == 'true');
	_enableContDownstream(taskID, continueDownstreamOnFailure, function(err) {
		debugConsol('err', err);
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
};

exports.wakeAllTasks = function(req, res) {
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var projID = req.body.projID;
	_wakeAllTasks(projID, function(err) {
		debugConsol('err', err);
		if (err) res.end(JSON.stringify(err));
		else res.end('success');
	});
}

exports.funcWakeTask = function(taskID, callback) {
	debugConsol('funcWakeTask', 'taskID: ' + taskID);
	_wakeTask(taskID, function(err) {
		if (err) return callback(err);
		else return callback(null);
	});
}

exports.funcGetMaxOrder = function(projID, callback) {
	_getMaxOrder(projID, function(err, maxOrder) {
		if (err) return callback(err, -1);
		else {
			return callback(null, maxOrder);
		}
	});
}

exports.funcSleepTask = function(taskID, callback) {
	_sleepTask(taskID, function(err) {
		if (err) return callback(err);
		else return callback(null);
	});
}

/**
 * Get the all the levels of the tasks in the project with JSON type
 * @param {string} projID
 * the project ID which you want to check
 * @param {fn} callback
 * receives the levels of the tasks in the project. Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 *   <li>tasksOrder (object): the orders of the tasks with JSON type. e.g.,{'task1' : 2, 'task2' : 3, 'task3' : 1}. If error occured, it will be null. </li>
 * </ul>
 */
function _getTasksOrder(projID, callback) {
	var tasksOrder = new Object();
	Testtask.find({
		proj_id: projID
	}, function(err, tasksInfo) {
		if (err) return callback(err, null);
		else {
			tasksInfo.forEach(function(taskInfo) {
				tasksOrder[taskInfo.testtaskname] = taskInfo.level;
			});
			return callback(null, tasksOrder);
		}
	});
}

/**
 * Wake up a task.
 * @param {string} taskID
 * the ID of the task which you want to wake
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _wakeTask(taskID, callback) {
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) return callback(err);
		else {
			if (taskInfo.level > 0) { // this task has been woken
				debugConsol('warn', 'the task has been woken.');
				return callback(null);
			} else {
				_getwokeTasksNum(taskInfo.proj_id, function(err, count) {
					if (err) return callback(err);
					else {
						taskInfo.level = count + 1;
						taskInfo.save(function(err) {
							if (err) return callback(err);
							// update the pipeline
							pipelineJs.funcUpdatePipeline(taskInfo.proj_id, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('debug', 'the task wakes up.');
									return callback(null);
								}
							});
						});
					}
				});
			}
		}
	});
}

/**
 * Sleep a task.
 * @param {string} taskID
 * the ID of the task which you want to sleep
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _sleepTask(taskID, callback) {
	debugConsol('_sleepTask', 'taskID: ' + taskID);
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) return callback(err);
		else {
			if (taskInfo.level == 0) { // this task has been slept
				debugConsol('warn', 'the task has been slept.');
				return callback(null);
			} else {
				_orderShift(taskID, function(err) {
					if (err) return callback(err);
					else {
						taskInfo.level = 0;
						taskInfo.save(function(err) {
							if (err) return err;
							// update the pipeline
							pipelineJs.funcUpdatePipeline(taskInfo.proj_id, function(err) {
								if (err) return callback(err);
								else {
									debugConsol('_sleepTask', 'funcUpdatePipeline success');
									return callback(null);
								}
							});
						});
					}
				});
			}
		}
	});
}

/**
 * Up a task level.
 * @param {string} taskID
 * the ID of the task which you want to level up
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _upOrderTask(taskID, callback) {
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) return callback(err);
		else {
			var curTaskLevel = taskInfo.level;
			if (curTaskLevel == 0) {
				return callback(new Error('the task is in the sleep status'));
			} else if (curTaskLevel == 1) {
				return callback(new Error('the task is the toppest'));
			} else {
				Testtask.find({
					proj_id: taskInfo.proj_id,
					level: curTaskLevel - 1
				}, function(err, tasksInfo) {
					if (err) return callback(err);
					else if (tasksInfo.length == 0) {
						return callback(new Error('unexpect error'));
					} else {
						async.eachSeries(tasksInfo, function(frontTask, callback) {
							frontTask.level++;
							frontTask.save();
							callback();
						}, function(err) {
							if (err) return callback(err);
							taskInfo.level--;
							taskInfo.save(function(err) {
								if (err) return callback(err);
								// update the pipeline
								pipelineJs.funcUpdatePipeline(taskInfo.proj_id, function(err) {
									if (err) return callback(err);
								});
							});
							return callback(null);
						});
					}
				});
			}
		}
	});
}

/**
 * Down a task level.
 * @param {string} taskID
 * the ID of the task which you want to level down
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _downOrderTask(taskID, callback) {
	Testtask.findById(taskID, function(err, taskInfo) {
		if (err) return callback(err);
		else {
			var curTaskLevel = taskInfo.level;
			if (curTaskLevel == 0) {
				return callback(new Error('the task is in the sleep status'));
			} else {
				_getwokeTasksNum(taskInfo.proj_id, function(err, count) {
					if (err) return callback(err);
					else if (curTaskLevel == count) {
						return callback(new Error('the task is the lowest'));
					} else {
						Testtask.find({
							proj_id: taskInfo.proj_id,
							level: curTaskLevel + 1
						}, function(err, tasksInfo) {
							if (err) return callback(err);
							else if (tasksInfo.length == 0) {
								return callback(new Error('unexpect error'));
							} else {
								async.eachSeries(tasksInfo, function(backTask, callback) {
									backTask.level--;
									backTask.save();
									callback();
								}, function(err) {
									if (err) return callback(err);
									taskInfo.level++;
									taskInfo.save(function(err) {
										if (err) return callback(err);
										// update the pipeline
										pipelineJs.funcUpdatePipeline(taskInfo.proj_id, function(err) {
											if (err) return callback(err);
										});
									});
									return callback(null);
								});
							}
						});
					}
				});
			}
		}
	});
}

/**
 * Enable or disable pipeline continuation when parent job fails
 * @param {string} taskID task id
 * @param {bool} enable enable or disable
 * @param {fn} callback receives the response. Parameters:
 *   <ul>
 *     <li>err: err object</li>
 *   </ul>
 * @private
 */
function _enableContDownstream(taskID, enable, callback) {
	Testtask.findByIdAndUpdate(taskID, {contdownstream: enable}, function(err, taskDoc) {
		if (err) return callback(err);
		pipelineJs.funcUpdatePipeline(taskDoc.proj_id, function(err) {
			if (err) return callback(err);
			return callback(null);
		});
	});
}

/**
 * Wake up all the tasks in the selected project.
 * @param {string} projID
 * the ID of the project whose tasks you want to wake up
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _wakeAllTasks(projID, callback) {
	Testtask.find({
		proj_id: projID
	}, function(err, tasksInfo) {
		if (err) return callback(err);
		else {
			_wakeTasksInAry(tasksInfo, 0, function(err) {
				if (err) return callback(err);
				else {
					// update the pipeline
					pipelineJs.funcUpdatePipeline(projID, function(err) {
						if (err) return callback(err);
					});
					return callback(null);
				}
			});
		}
	});
}

function _getMaxOrder(projID, callback) {
	Testtask.find({
		proj_id: projID
	}, function(err, tasksInfo) {
		if (err) return callback(err);
		else {
			_maxOrderInTasks(tasksInfo, 0, 0, function(err, maxOrder) {
				debugConsol('_getMaxOrder', maxOrder);
				if (err) return callback(err, -1);
				else return callback(null, maxOrder);
			});
		}
	});
}

/**
 * Get the number of the tasks which has been woken.
 * @param {string} projID
 * the project ID which you want to check
 * @param {fn} callback
 * receives the number of the tasks which has been woken. Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 *   <li>counter (number): the number of the tasks which has been woken </li>
 * </ul>
 */
function _getwokeTasksNum(projID, callback) {
	Testtask.find({
		proj_id: projID
	}, function(err, tasksInfo) {
		if (err) return callback(err, null);
		else {
			var counter = 0;
			tasksInfo.forEach(function(taskInfo) {
				if (taskInfo.level > 0)
					counter++;
			});
			return callback(null, counter);
		}
	});
}

/**
 * When a task's level set zero (or called sleep), the other task whose level greater than chose task's level need to be shift.
 * @param {string} taskID
 * the ID of the task which is sleep
 * @param {fn} callback
 * receives the number of the tasks which has been woken. Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _orderShift(taskID, callback) {
	Testtask.findById(taskID, function(err, choseTaskInfo) {
		if (err) return callback(err);
		// get chose task level
		var choseTaskLevel = choseTaskInfo.level;
		// find all the tasks which are in the same project
		Testtask.find({
			proj_id: choseTaskInfo.proj_id
		}, function(err, tasksInfo) {
			if (err) return callback(err);
			else {
				tasksInfo.forEach(function(taskInfo) {
					if (taskInfo.level > choseTaskLevel) { // only the task whose level greater than chose task's level need to be shift
						taskInfo.level--;
						taskInfo.save();
					}
				});
				return callback(null);
			}
		});
	});
}

/**
 * Wake the tasks whose index greater than the given index with asynchronous JavaScript
 * @param {obj} taskAry
 * the array contains the tasks
 * @param {number} index
 * the tasks' index greater than the index will be woke up 
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 * </ul>
 */
function _wakeTasksInAry(taskAry, index, callback) {
	if (index >= taskAry.length) {
		return callback(null);
	} else {
		// wake the i-th task
		_wakeTask(taskAry[index]._id, function(err) {
			if (err) return callback(err);
			else {
				// wake next task
				index++;
				_wakeTasksInAry(taskAry, index, function(err) {
					if (err) return callback(err);
					else return callback(null);
				});
			}
		});
	}
}

/**
 * Return the highest level of the task in the project
 * @param {obj} taskAry
 * the array contains the tasks
 * @param {number} index
 * the tasks' index greater than the index will be considered
 * @param {number} curMaxOrder
 * the highlest level which you know
 * @param {fn} callback
 * Parameters:
 * <ul>
 *   <li>err (object): error object</li>
 *   <li>maxOrder (object): the highest level</li>
 * </ul>
 */
function _maxOrderInTasks(taskAry, index, curMaxOrder, callback) {
	if (index >= taskAry.length) {
		return callback(null, curMaxOrder);
	} else {
		if (taskAry[index].level > curMaxOrder) {
			curMaxOrder = taskAry[index].level;
			_maxOrderInTasks(taskAry, ++index, curMaxOrder, function(err, maxOrder) {
				return callback(null, maxOrder);
			});
		} else {
			_maxOrderInTasks(taskAry, ++index, curMaxOrder, function(err, maxOrder) {
				return callback(null, maxOrder);
			});
		}
	}
}

function debugConsol(label, value) {
	console.log('\n[' + label + ']');
	console.log(value);
	return;
}

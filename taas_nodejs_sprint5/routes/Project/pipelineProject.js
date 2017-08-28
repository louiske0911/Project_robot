let DBM = require('../DBM/databaseManagement');
let PROJECT_MODEL = DBM.PROJECT_MODEL;
let JenkinsPipelineJob = require('../../models/jenkins/pipelineJob').JenkinsPipelineJob;
let cookie = require('../../lib/cookie');
let logger = require('../../lib/logging').log_routes('Routes');
let time = require('../../lib/time');
let session = require('../../lib/session');

/**
 * Project status page
 */
exports.projectStatusPage = function(req, res) {
	let sessionCheck = session.checkLoginbySessBool(req);

	if (!sessionCheck) {
		return res.redirect('/');
	}

	function handleError(err) {
	    logger.error(err.toString());
	    return res.status(500).send({error: err.toString()});
    }

	// TODO: filter user project list
    let projId = req.params.pid;
	PROJECT_MODEL.findById(projId, function (err, proj) {
	    if (err) {
	        return handleError(err);
        }
        res.render('project_overview', {
            projName: proj.proj_name,
            userName: cookie.getCookieofUserName(req)
        });
    });
};


/**
 * API: get project recent runs
 */
exports.projectRunsAPI = function(req, res) {
	let sessionCheck = session.checkLoginbySessBool(req);

	if (!sessionCheck) {
		return res.redirect('/');
	}

	function handleError(err) {
	    logger.error(err.toString());
	    return res.status(500).send({error: err.toString()});
    }

	// TODO: filter user project list
    let projId = req.params.pid;
    PROJECT_MODEL.findById(projId, function (err, proj) {
        if (err) {
            return handleError(err);
        }
        let pipelineName = proj.pipelinename;
        if (pipelineName === '') {
            return handleError('No pipeline found');
        }
        let job = new JenkinsPipelineJob(pipelineName);
        job.getRunStatusList(function (err, runs) {
            if (err) {
                return handleError(err);
            }
            for (let runs_idx in runs) {
                let run = runs[runs_idx];
                run.relTime = run.timestamp? time.formatRelativeTime(run.timestamp) : '';
                if (!run.duration) run.durationStr = run.duration;
                else if (run.duration < 60000) run.durationStr = Math.round(run.duration/1000) + ' seconds';
                else run.durationStr = time.formatDuration(run.duration);
            }
            return res.json(runs);
        });
    });
};


/**
 * API: trigger a project run
 */
exports.projectTriggerAPI = function(req, res) {
    let sessionCheck = session.checkLoginbySessBool(req);

	if (!sessionCheck) {
		return res.redirect('/');
	}

	function handleError(err) {
	    logger.error(err.toString());
	    return res.status(500).send({error: err.toString()});
    }

	// TODO: filter user project list
    let projId = req.params.pid;
    PROJECT_MODEL.findById(projId, function (err, proj) {
        if (err) {
            return handleError(err);
        }
        let pipelineName = proj.pipelinename;
        if (pipelineName === '') {
            return handleError('No pipeline found');
        }
        let job = new JenkinsPipelineJob(pipelineName);
        let opts = {};
        job.triggerRun(opts, function (err) {
            if (err) {
                return handleError(err);
            }
            return res.json(0);
        });
    });
};


/**
 * Project run log page
 */
exports.projectRunLogPage = function(req, res) {
    let sessionCheck = session.checkLoginbySessBool(req);

	if (!sessionCheck) {
		return res.redirect('/');
	}

	function handleError(err) {
	    logger.error(err.toString());
	    return res.status(500).send({error: err.toString()});
    }

	// TODO: filter user project list
    let projId = req.params.pid;
	let runId = req.params.rid;
	PROJECT_MODEL.findById(projId, function (err, proj) {
	    if (err) {
	        return handleError(err);
        }
        res.render('project_run_log', {
            projId: projId,
            projName: proj.proj_name,
            runId: runId,
            userName: cookie.getCookieofUserName(req)
        });
    });
};


/**
 * API: get a project recent (or latest) run
 */
exports.projectSingleRunAPI = function(req, res) {
    let sessionCheck = session.checkLoginbySessBool(req);

	if (!sessionCheck) {
		return res.redirect('/');
	}

	function handleError(err) {
	    logger.error(err.toString());
	    return res.status(500).send({error: err.toString()});
    }

	// TODO: filter user project list
    let projId = req.params.pid;
	let runId = req.params.rid;
    PROJECT_MODEL.findById(projId, function (err, proj) {
        if (err) {
            return handleError(err);
        }
        let pipelineName = proj.pipelinename;
        if (pipelineName === '') {
            return handleError('No pipeline found');
        }
        let job = new JenkinsPipelineJob(pipelineName);
        job.getRunStatus(runId, function(err, run) {
            if (err) {
                return handleError(err);
            }
            run.relTime = run.timestamp? time.formatRelativeTime(run.timestamp) : '';
            if (!run.duration) run.durationStr = run.duration;
            else if (run.duration < 60000) run.durationStr = Math.round(run.duration/1000) + ' seconds';
            else run.durationStr = time.formatDuration(run.duration);
            return res.json(run);
        });
    });
};


/**
 * API: get run log for a recent run
 */
exports.projectRunLogAPI = function(req, res) {
    let sessionCheck = session.checkLoginbySessBool(req);

	if (!sessionCheck) {
		return res.redirect('/');
	}

	function handleError(err) {
	    logger.error(err.toString());
	    return res.status(500).send({error: err.toString()});
    }

	// TODO: filter user project list
    let projId = req.params.pid;
	let runId = req.params.rid;
	let startOffset = req.params.start;
    PROJECT_MODEL.findById(projId, function (err, proj) {
        if (err) {
            return handleError(err);
        }
        let pipelineName = proj.pipelinename;
        if (pipelineName === '') {
            return handleError('No pipeline found');
        }
        let job = new JenkinsPipelineJob(pipelineName);
        let opts = {
            runNumber: runId,
            start: startOffset
        };
        job.getRunLog(opts, function(err, log, more, size) {
            if (err) {
                return handleError(err);
            }
            return res.json({
                log: log,
                more: more,
                size: size
            });
        });
    });
};
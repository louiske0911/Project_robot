/**
 * @fileoverview Jenkins 2 Pipeline integration
 */
let async = require('async');
let conf = require('../../lib/config');
let logger = require('./getLogger').logger;
let util = require('util');

let jenkinsMasterURL = '10.206.20.10:8500';
let jenkinsMasterUser = 'user';
let jenkinsMasterAPIToken = 'df944eee9cded4c57ebc29eb59864825';
const DEFAULT_TIMEOUT = conf.get('jenkins_timeout');
let jenkins = require('jenkins')({baseUrl: util.format('http://%s:%s@%s', jenkinsMasterUser, jenkinsMasterAPIToken, jenkinsMasterURL), crumbIssuer: true});  // create a service proxy to Jenkins master
let JenkinsJobModel = require('../../routes/DBM/databaseManagement').JENKINSJOB_MODEL;


/**
 * Jenkins Pipeline job
 * @param {String} jobName job name
 * @constructor
 */
function JenkinsPipelineJob(jobName) {
    this._name = jobName;
}


/**
 * Get a subset of attributes of a run.
 * Note: For queued runs, call _getQueuedRunInfo instead
 * Attributes: number, queueId, result, timestamp, duration, inQueue
 * callback(err, data)
 * @private
 */
function _getRunInfo(jobName, runNumber, callback) {
    jenkins.build.get(jobName, runNumber, function(err, data) {
        if (err) {
            let errObj = new Error('Jenkins run get error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj, null);
        }
        // Store a subset of run attributes
        let runInfo = {
            number: data.number,
            queueId: data.queueId,
            result: data.result,
            timestamp: data.timestamp,
            duration: data.duration,
            inQueue: false
        };
        return callback(err, runInfo);
    });
}


/**
 * Get a subset of attributes of a queued run.
 * Attributes: number, queueId, result, timestamp, duration, inQueue
 * @private
 */
function _getQueuedRunInfo(queueItem) {
    let runInfo = {
        number: null,
        queueId: queueItem.id,
        result: null,
        timestamp: queueItem.inQueueSince,
        duration: null,
        inQueue: true
    };
    return runInfo;
}


/**
 * Map run list to run info list.
 * callback(err, data)
 * @private
 */
function _mapRunInfoLimit(jobName, runNumberArr, limit, callback) {
    var srcArr = limit? runNumberArr.slice(0, limit): runNumberArr;
    async.map(srcArr, function(runNumber, asyncMapCallback) {
        _getRunInfo(jobName, runNumber, function(err, runInfo) {
            if (err) {
                let errObj = new Error('Jenkins run get error: ' + err.toString());
                logger.error(errObj);
                return asyncMapCallback(errObj);
            }
            return asyncMapCallback(err, runInfo);
        });
    }, function(err, runInfoArr) {
        if (err) {
            let errObj = new Error('Jenkins run get error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj);
        }
        return callback(err, runInfoArr);
    });
}


/**
 * Create / update / delete Jenkins credentials
 * @private
 */
function _makeCredentialsCmd(jobName, jobCfgOptsOrig, jobCfgOpts, callback) {

    function onError(err) {
        logger.error(err);
        return callback(err);
    }

    function makeCredentialId(idSuffix) {
        return idSuffix? jobName + idSuffix : jobName;
    }

    function diffCredential(credOrig, credNew) {
        return !(
            credOrig.username == credNew.username &&
                credOrig.password == credNew.password &&
                    credOrig.privateKey == credNew.privateKey
        );
    }

    var credListOrig = (jobCfgOptsOrig && jobCfgOptsOrig._credentials)? jobCfgOptsOrig._credentials : [];
    var credListNew = (jobCfgOpts&& jobCfgOpts._credentials)? jobCfgOpts._credentials : [];
    var handledList = new Set();
    var cmdList = [];

    function makeCredentialCmd(cred) {
        if (cred.username && cred.privateKey) {
            cmdList.push(util.format(
                'smartUpdateCredential("%s", makeSSHPrivateKeyCredential("%s", "%s", """%s"""))',
                makeCredentialId(cred.idSuffix),
                makeCredentialId(cred.idSuffix),
                cred.username,
                cred.privateKey
            ));
        }
        else if (cred.username) {
            cmdList.push(util.format(
                'smartUpdateCredential("%s", makeUsernamePasswordCredential("%s", "%s", "%s"))',
                makeCredentialId(cred.idSuffix),
                makeCredentialId(cred.idSuffix),
                cred.username,
                cred.password? cred.password : ''
            ));
        }
        else {
            return new Error('Invalid credentials settings');
        }
    }

    function findCredentialByIdSuffix(credIdSuffix) {
        let credMatch = credListNew.find(function(ele, idx, arr) {
            return (ele.idSuffix == credIdSuffix);
        });
        return credMatch;
    }

    for (let cred of credListOrig) {
        handledList.add(cred);
        let credMatch = findCredentialByIdSuffix(cred.idSuffix);
        // delete credential
        if (!credMatch) {
            cmdList.push(util.format('smartUpdateCredential("%s", null)', makeCredentialId(cred.idSuffix)));
        }
        // update credential
        else if (diffCredential(cred, credMatch)) {
            let err = makeCredentialCmd(credMatch);
            if (err) return onError(err);
        }
    }

    for (let cred of credListNew) {
        // create credential
        if (!handledList.has(cred)) {
            let err = makeCredentialCmd(cred);
            if (err) return onError(err);
        }
    }

    return callback(null, cmdList);
}

/**
 * Try to schedule a run for the job.
 * @param {Object} opts (optional) trigger options. Attributes:
 *   <ul>
 *     <li>parameters (Object): run parameters.
 *   </ul>
 * @param {Function} callback receives the trigger response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *   </ul>
 */
JenkinsPipelineJob.prototype.triggerRun = function(opts, callback) {
    let self = this;  // for accessing the job instance in nested functions

    // trigger the job
    const jobName = self._name;
    jenkins.job.build(jobName, function(err) {
        if (err) {
            let errObj = new Error('Jenkins pipeline job trigger error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj);
        }
        logger.info('Trigger a Jenkins pipeline job: ' + jobName);
        return callback(err);
    });
};


/**
 * Get recent run status of the job.<br>
 * <em>Note:</em> This method does not retrieve complete run status history;
 * when the runs exceed the capacity, the oldest ones will be deleted.
 * @param {Function} callback receives the runs of the job. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>
 *       runs: the list of run history in the following order:
 *       <ul>
 *         <li>Queued runs preceding ongoing runs or finished runs.</li>
 *         <li>The order of queued runs is undefined.</li>
 *         <li>Ongoing runs or finished runs are sorted by number's decreasingly.</li>
 *       </ul>
 *       Note: aborted jobs are not returned.<br/>
 *       Each run is a JSON object. Attributes:
 *       <ul>
 *         <li>number: run number (integer)</li>
 *         <li>queueId: queue number (integer)</li>
 *         <li>inQueue: true or false</li>
 *         <li>result: 'SUCCESS', 'FAILURE', 'UNSTABLE', or null</li>
 *         <li>timestamp: start timestamp (integer)</li>
 *         <li>duration: duration in msec (integer)</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsPipelineJob.prototype.getRunStatusList = function(callback) {
    let runs;  // finished runs
    let runInQueue;  // queued run
    let result = null;  // run status history (value to return)
    let self = this;  // for accessing the job instance in nested functions

    async.series([
        // get run numbers
        async.timeout(function(asyncSeriesCallback) {
            jenkins.job.get(self._name, function(err, data) {
                if (err) {
                    let errObj = new Error('Jenkins job get error: ' + err.toString());
                    return asyncSeriesCallback(errObj);
                }
                runs = data.builds;
                runInQueue = data.queueItem;
                return asyncSeriesCallback(null);
            });
        }, DEFAULT_TIMEOUT, 'get run numbers timeout'),

        // get status of each run
        async.timeout(function(asyncSeriesCallback) {
            let limit = null;  // no iteration limit in map operation
            let runNumberArr = runs.map(function (aRun) {
                return aRun.number;
            });
            // sort the runs by run numbers decreasingly
            runNumberArr.sort(function(item1, item2) {
                return item2 - item1;
            });
            _mapRunInfoLimit(self._name, runNumberArr, limit, function(err, runInfoArr) {
                if (err) {
                    let errObj = new Error('Jenkins run info get error: ' + err.toString());
                    return asyncSeriesCallback(errObj);
                }
                if (runInQueue) {
                    // insert the queued run in the beginning
                    runInfoArr.unshift(_getQueuedRunInfo(runInQueue));
                }
                result = runInfoArr;
                return asyncSeriesCallback(null);
            });
        }, DEFAULT_TIMEOUT, 'get run status timeout')

        // error handling
    ], function(err) {
        if (err) {
            let errName = 'models.jenkins.job JenkinsPipelineJob#getRunStatusList';
            if (err.name) errName += (' ' + err.name);
            err.name = errName;

            logger.error(err.toString());
            return callback(err);
        }
        else {
            return callback(null, result);
        }
    });
};


/**
 * Get a recent run status of the job.
 *
 * Note: aborted jobs are not returned.
 * @param {number} run run status to retrieve; pass 0 to get the latest run
 * @param {Function} callback receives the latest run(s) of the job. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li> run: the latest run;
 *       Each run is a JSON object. Attributes:
 *       <ul>
 *         <li>number: run number (integer)</li>
 *         <li>queueId: queue number (integer)</li>
 *         <li>inQueue: true or false</li>
 *         <li>result: 'SUCCESS', 'FAILURE', 'UNSTABLE', or null</li>
 *         <li>timestamp: start timestamp (integer)</li>
 *         <li>duration: duration in msec (integer)</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsPipelineJob.prototype.getRunStatus = function(run, callback) {
    let runs;  // finished runs
    let runInQueue;  // queued run
    let result = null;
    let self = this;  // for accessing the job instance in nested functions

    async.series([
        // Get run list for the job
        async.timeout(function(asyncSeriesCallback) {
            // skip this step if run is specified
            if (run > 0) {
                return asyncSeriesCallback(null);
            }
            jenkins.job.get(self._name, function(err, data) {
                if (err) {
                    let errObj = new Error('Jenkins job get error: ' + err.toString());
                    return asyncSeriesCallback(errObj);
                }
                runs = data.builds;
                runInQueue = data.queueItem;
                return asyncSeriesCallback(null);
            });
        }, DEFAULT_TIMEOUT, 'get run numbers timeout'),
        // Get info for each run
        async.timeout(function(asyncSeriesCallback) {
            // Priority 0: run is specified
            if (run > 0) {
                _getRunInfo(self._name, run, function(err, runInfo) {
                    result = runInfo;
                    return asyncSeriesCallback(err);
                });
            }
            // Priority 1: queued run
            else if (runInQueue) {
                result = _getQueuedRunInfo(runInQueue);
                return asyncSeriesCallback(null);
            }
            // Priority 2: run with the largest run number
            else if (runs && runs.length) {
                run = runs.reduce(
                    function(preVal, curVal) {
                        return (!preVal || curVal.number > preVal.number)? curVal : preVal;
                    },
                    null
                );
                _getRunInfo(self._name, run, function(err, runInfo) {
                    result = runInfo;
                    return asyncSeriesCallback(err);
                });
            }
            // No recent runs
            else {
                result = null;
                return asyncSeriesCallback(null);
            }

        }, DEFAULT_TIMEOUT, 'get run status timeout')

        // Error handling
    ], function(err) {
        console.log('=====');
        console.log(err);
        console.log('=====');
        console.log(result);
        console.log('=====');
        if (err) {
            let errName = 'models.jenkins.job JenkinsPipelineJob#getRunStatus';
            if (err.name) errName += (' ' + err.name);
            err.name = errName;

            logger.error(err.toString());
            return callback(err);
        }
        else {
            return callback(null, result);
        }
    });
};


/**
 * Get run log of the job.
 * This method can be called for ongoing runs.
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number): the run number</li>
 *     <li>start (number, optional): start offset</li>
 *   </ul>
 * @param {Function} callback receives the latest run log of the job. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>log (string): the run log text (string)</li>
 *     <li>more (boolean): if there is more log</li>
 *     <li>size (number): used with start to offset on subsequent calls</li>
 *   </ul>
 */
JenkinsPipelineJob.prototype.getRunLog = function(opts, callback) {
    let jobName = this._name;
    let runNumber = opts.runNumber;
    let startOffset = opts.start;
    let runLog = null;
    async.series([
        // Get run log
        async.timeout(function(asyncSeriesCallback) {
            logger.debug('JenkinsPipelineJob#getRunLog: [' + jobName + '] get run log, start=' + startOffset);
            let jenkinsOptions = {
                name: jobName,
                number: runNumber,
                start: startOffset,
                meta: true
            };
            jenkins.build.log(jenkinsOptions, function(err, runLogRet) {
                if (err) {
                    return asyncSeriesCallback(new Error('Jenkins run log get error: ' + err.toString()));
                }
                runLog = runLogRet;
                return asyncSeriesCallback(null);
            });
        }, DEFAULT_TIMEOUT, 'get run log timeout')

        // Error handling
    ], function(err) {
        logger.debug('JenkinsJob#getRunLog: [' + jobName + '] op done');
        if (err) {
            let errName = 'models.jenkins.job JenkinsPipelineJob#getRunLog';
            if (err.name) errName += (' ' + err.name);
            err.name = errName;

            logger.error(err.toString());
            return callback(err);
        }
        else {
            return callback(null, runLog.text, runLog.more, runLog.size);
        }
    });
};


module.exports.JenkinsPipelineJob = JenkinsPipelineJob;
/**
 * @fileoverview Jenkins integration (basic functions)
 */
var conf = require('../../lib/config');
var jenkinsMasterURL = conf.get('jenkins_master');
var UNIT_TEST = conf.get('unit_test');
const DEFAULT_TIMEOUT = conf.get('jenkins_timeout');

var jenkins = require('jenkins')(jenkinsMasterURL);  // create a service proxy to Jenkins master
var async = require('async');
var util = require('util');
var path = require('path');
var ejs = require('ejs');
var crypto = require('crypto');
var fs = require('fs');
var url = require('url');
var logger = require('./getLogger').logger;
var JenkinsJobModel = require('../../routes/DBM/databaseManagement').JENKINSJOB_MODEL;
var archive = require('./archive');
var postTextData = require('../../lib/httpPost').postTextData;


/**
 * Generic Jenkins job. This is the base class for all Jenkins job classes.
 * @constructor
 * @param {String} jobName job name
 */
function JenkinsJob(jobName) {
    this._name = jobName;
    this._type = 'abstract';
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
        var runInfo = {
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
    var runInfo = {
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
 * Get the run with the largest run number.
 * Note: Where there are ongoing runs or finished runs, queued runs will be skipped.
 * @returns {Object} the run with the largest run number,
 *   or null if there is no run given.
 * @private
 */
function _getLastRun(runInfoArr) {
    if (runInfoArr.length) {
        var lastRun = runInfoArr.reduce(
            function(preVal, curVal) {
                return (!preVal || curVal.number > preVal.number)?
                    curVal: preVal;
            },
            null
        );
        return lastRun;
    }
    return null;
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
 * Create / update / reconfigure a job
 * @private
 */
function _configJob(jobName, jobType, jobCfgOpts, op, callback) {

    function onError(err, code) {
        logger.error(err);
        if (!code) code = JenkinsJob.UPDATE.ERROR;
        return callback(err, code);
    }

    var opName = (op===_configJob.OP.CREATE)? 'create' :
        ((op===_configJob.OP.UPDATE)? 'update' : 'reconfigure');

    var jobCfgOptsOrig = null;  // existing job configuration options

    async.waterfall([

        // read job from db
        function(asyncWFCallback) {
            JenkinsJobModel.findById(jobName, function(err, jobModel) {
                if (err) return asyncWFCallback(new Error('Jenkins job config error: ' + err.toString()));

                // check existence of job
                if (jobModel) {
                    // create: cannot duplicate jobs
                    if (op === _configJob.OP.CREATE) {
                        let errObj = new Error(util.format('Jenkins job create error: job %s already exists', jobName));
                        return asyncWFCallback(errObj, JenkinsJob.UPDATE.ALREADY_EXISTS);
                    }
                    if (op === _configJob.OP.RECONFIG) {
                        jobType = jobModel.type;
                        jobCfgOpts = jobCfgOptsOrig = JSON.parse(jobModel.opts);
                    }
                    else {
                        jobCfgOptsOrig = JSON.parse(jobModel.opts);
                        jobModel.opts = JSON.stringify(jobCfgOpts);
                    }
                }
                else {
                    // update: cannot update non-existing job
                    if (op === _configJob.OP.UPDATE || op === _configJob.OP.RECONFIG) {
                        let errObj = new Error(util.format('Jenkins job %s error: job %s does not exist', opName, jobName));
                        return asyncWFCallback(errObj, JenkinsJob.UPDATE.NOT_EXISTS);
                    }

                    jobModel = new JenkinsJobModel({
                        _id: jobName,
                        type: jobType,
                        opts: JSON.stringify(jobCfgOpts)
                    });
                }

                return asyncWFCallback(null, jobModel);
            });
        },

        // update job in db
        function(jobModel, asyncWFCallback) {
            jobModel.save(function(err) {
                if (err) return asyncWFCallback(new Error(util.format('Jenkins job %s update db error: %s', opName, err.toString())));
                return asyncWFCallback(null, jobModel);
            });
        },

        // update credentials
        function(jobModel, asyncWFCallback) {
            _makeCredentialsCmd(jobName, jobCfgOptsOrig, jobCfgOpts, function(err, cmdList) {
                if (err) return asyncWFCallback(err);

                if (cmdList && cmdList.length) {
                    fs.readFile(path.join(__dirname, 'credentials.groovy'), 'utf-8', function(err, data) {
                        if (err) return asyncWFCallback(err);
                        var jenkinsMasterURLObj = url.parse(jenkinsMasterURL);
                        postTextData(
                            jenkinsMasterURLObj.hostname,
                            jenkinsMasterURLObj.port,
                            '/scriptText',
                            {script: data + '\n' + cmdList.join('\n')},
                            function(err, response) {
                                if (err) return asyncWFCallback(err);
                                logger.info('Update Jenkins credentials: ' + response);
                                return asyncWFCallback(null, jobModel);
                            }
                        );
                    });
                }
                else {
                    return asyncWFCallback(null, jobModel);
                }
            });
        },

        // extend job config options to support pipeline & build discarding
        function(jobModel, asyncWFCallback) {

            // build after and copy workspace from the upstream job
            if (jobModel.parent) {
                let scmCloneWorkspaceCriteria = 'Not Failed';
                let triggerThresholdName = 'UNSTABLE';
                let triggerThresholdOrdinal = '1';
                let triggerThresholdColor = 'YELLOW';
                if (jobModel.continueOnParentFailure) {
                    scmCloneWorkspaceCriteria = 'Any';
                    triggerThresholdName = 'FAILURE';
                    triggerThresholdOrdinal = '2';
                    triggerThresholdColor = 'RED';
                }
                if (!jobCfgOpts.scm) jobCfgOpts.scm = {};
                jobCfgOpts.scm.cloneWorkspace = {
                    parentJobName: jobModel.parent,
                    criteria: scmCloneWorkspaceCriteria
                };

                if (!jobCfgOpts.triggers) jobCfgOpts.triggers = [];
                jobCfgOpts.triggers.push({
                    type: 'parentJob',
                    upstreamProjects: jobModel.parent,
                    threshold_name: triggerThresholdName,
                    threshold_ordinal: triggerThresholdOrdinal,
                    threshold_color: triggerThresholdColor
                });
            }

            // enforce discarding old builds
            function findBuildDiscarder(ele, idx, arr) {
                return ele.type === 'buildDiscarder';
            }

            if (!jobCfgOpts.properties) {
                jobCfgOpts.properties = [];

                if (jobCfgOpts.properties.findIndex(findBuildDiscarder) < 0) {
                    jobCfgOpts.properties.push({
                        type: 'buildDiscarder',
                        daysToKeep: 30,
                        numToKeep: 30
                    });
                }
            }

            // archive workspace to copy to downstream jobs
            if (!jobCfgOpts.publishers) jobCfgOpts.publishers = [];
            jobCfgOpts.publishers.push({
                type: 'cloneWorkspace',
                criteria: 'Any'  // even when build fails
            });

            return asyncWFCallback(null);
        },

        // generate config XML
        function(asyncWFCallback) {
            ejs.renderFile(path.join(__dirname, 'jobCfg/main.ejs'), {vars: jobCfgOpts}, function(err, jobCfg) {
                if (err) return asyncWFCallback(new Error('Jenkins job configuration creation error: ' + err.toString()));
                return asyncWFCallback(null, jobCfg);
            });
        },

        // configure job
        function(jobCfg, asyncWFCallback) {
            var jenkinsFunc = (op === _configJob.OP.CREATE)? jenkins.job.create : jenkins.job.config;
            jenkinsFunc.call(jenkins.job, jobName, jobCfg, function(err) {
                if (err) {
                    let errObj = new Error(util.format('Jenkins job %s error: %s', opName, err.toString()));
                    return asyncWFCallback(errObj);
                }
                return asyncWFCallback(null);
            });
        }
    ],

    // Error handling
    function(err, result) {
        if (err) return onError(err, result);
        return callback(null, JenkinsJob.UPDATE.OK, jobName);
    });
}

/**
 * @private
 */
_configJob.OP = {
    // create a new job
    CREATE: 1,
    // update an existing job
    UPDATE: 2,
    // reconfigure an existing job (the job options generated by plugins remain unchanged)
    RECONFIG: 3
};


/**
 * Reconfigure a jenkins job.
 * <br/><em>Note:</em> this method is intended to be called by pipeline only.
 * <br/>The job options from the plugins remain unchanged,
 * and the job options from the plugins as well as from the pipelines are read
 * again and passed to Jenkins server.
 * @param {string} jobName job name
 * @param {fn} callback receives the job creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>code: update response. Options:
 *       <ul>
 *         <li>JenkinsJob.UPDATE.OK</li>
 *         <li>JenkinsJob.UPDATE.NOT_EXISTS</li>
 *         <li>JenkinsJob.UPDATE.ERROR</li>
 *       </ul>
 *     </li>
 *     <li>jobName: affected job name</li>
 *   </ul>
 */
JenkinsJob.reconfigJob = function(jobName, callback) {
    _configJob(jobName, null, null, _configJob.OP.RECONFIG, callback);
};


/**
 * Create a new name for Jenkins jobs. <br/>
 * <em>Note:</em> NEVER call this directly.
 * @static
 * @param {string} prefix prefix of job name
 * @returns {string} new job name
 * @protected
 */
JenkinsJob._createJobName = function(prefix) {
    // date part: YYYYMMDD
    var jobDateObj = new Date();
    jobDate= jobDateObj.toISOString().substr(0, 10).split('-').join('');

    // rand part: 8 hex random numbers
    var rndLen = 8;
    var rnd = crypto.randomBytes(Math.ceil(rndLen/2)).
        toString('hex').slice(0, rndLen);
    var jobName = util.format('%s-%s-%s', prefix, jobDate, rnd);

    return jobName;
};


/**
 * Get the Jenkins job type
 *
 * @returns {string} job type
 */
JenkinsJob.prototype.getJobType = function() {
    return this._type;
};


/**
 * Get the jenkins job name (job identifier)
 *
 * @returns {string} job name
 */
JenkinsJob.prototype.getJobName = function() {
    return this._name;
};


/**
 * Get job list.
 * @static
 * @param {fn} callback receives the job list. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>data: the list of job names</li>
 *   </ul>
 */
JenkinsJob.getAllJobs = function(callback) {
    // TODO: query db instead
    jenkins.job.list(function(err, data) {
        if (err) {
            let errObj = new Error('Jenkins job listing error: ' + err.toString());
            logger.error(errObj);
            callback(errObj, null);
            return;
        }
        var jobNames = [];
        for (let idx in data) {
            jobNames.push(data[idx].name);
        }
        logger.info('Jenkins job listing finished: %s', jobNames.toString());
        return callback(err, jobNames);
    });
};


/**
 * Enum for job the attribute types in an option descriptor
 * @readonly
 * @enum {number}
 */
JenkinsJob.DESCRIPTOR_TYPE = {
    /**
     * Not an option. It can skipped directly.
     */
    NONE: 0,
    /**
     * An integer. Related attributes:
     *   <ul>
     *     <li>min (integer, optional): the minimal accepted value;
     *       when not given, it expects 0 or a positive number.</li>
     *     <li>max (integer, optional): the maximal accepted value;
     *       when not given, it does not constraint the maximal value,
     *       which is essentially a number not greater than Numeric.MAX_SAFE_INTEGER (2^53 -1).</li>
     *   </ul>
     */
    NUMBER: 10,
    /**
     * A decimal value that could be an integer or a floating number. Related attributes:
     *   <ul>
     *     <li>min (numeric, optional): the minimal accepted value;
     *       when not given, it expects 0.0 or a positive value.</li>
     *     <li>max (numeric, optional): the maximal accepted value;
     *       when not given, it does not constraint the maximal value,
     *       which is essentially a value not greater than Numeric.MAX_VALUE.</li>
     *   </ul>
     */
    DECIMAL: 11,
    /**
     * A UTF-8-encoded string. Related attributes:
     *   <ul>
     *     <li>length (integer, optional): the maximal length of the string;
     *       when not given, it accepts a string of any length.</li>
     *     <li>longText (boolean, optional): the multi-line mode of the string;
     *       when not given or evaluates as false, it accepts a one-liner string;
     *       when evaluates as true, it accepts a long string that may span multiple lines.</li>
     *     <li>required (boolean, optional): make sure that the string isn't empty before send</li>
     *     <li>groupCheck (string, optional): use this string to represents a group and make sure that
     *         every group has at least one which is not empty</li>
     *     <li>groupCheckExclusive(boolean, optional): It will work when groupCheck is activated.
     *         It can make sure that there will be just one string to be filled.</li>
     *   </ul>
     */
    STRING: 20,
    /**
     * A UTF-8-encoded string representing a password. Related attributes:
     *   <ul>
     *     <li>length (integer, optional): the maximal length of the string;
     *       when not given, it accepts a string of any length.</li>
     *   </ul>
     */
    PASSWORD: 21,
    /**
     * A single choice or multiple selection. Related attributes:
     *   <ul>
     *     <li>multiple (boolean, optional): the selection mode;
     *       when not given or evaluates as false, it is a single choice;
     *       when evaluates as true, it is a multiple choice.</li>
     *     <li>options (array): an array of available options; Attributes:
     *         <ul>
     *           <li>value (numeric or string): the value of this option</li>
     *           <li>displayName (string): the text to display to users</li>
     *           <li>displayHint (string): the additional text to display to users</li>
     *         </ul>
     *       </li>
     *   </ul>
     */
    OPTION: 30,
    /**
     * A string representing a URL. Related attributes:
     *   <ul>
     *     <li>protocols (array, optional): the URL protocols;<br/>
     *       when not gievn, any protocol is accepted;
     *       when given, it is an array of strings specifying the accepted protocols.</li>
     *     <li>alreadyExists (boolean, optional): the URL existence;<br/>
     *       when not given or evaluates as false, a URL could be accepted even if it has not existed yet;
     *       when evaluates as true, a URL will be accepted only when it actually exists.</li>
     *   </ul>
     */
    URL: 40,
    /**
     * A string representing a path.
     * The path deliminator could be a slash (/) or a back-slash (\). Related attributes:
     *   <ul>
     *     <li>allowAbsolute (boolean, optional): allow for absolute paths;<br/>
     *       when not given or evaluates as false, only relative paths are accepted;
     *       when evaluates as true, absolute paths and relative paths are both accepted.</li>
     *     <li>allowParent (boolean, optional): allow for escaping to parent directories;<br/>
     *       when not given or evaluates as false,
     *       it is prohibited for any part of relative paths to point to the parent directores
     *       (that is, the path could only point to the current directory or to its child directories);
     *       when evaluates as true, the relative path could point to any directory.<br/>
     *       <em>Note:</em> this attribute is only effective for relative paths.</li>
     *   </ul>
     */
    PATH: 41,
    /**
     * A string representing an email address. Related attributes:
     *   <ul>
     *     <li>alreadyExists (boolean, optional): the address existence;<br/>
     *       when not given or evaluates as false, an address could be accepted even if it has not existed yet;
     *       when evaluates as true, an address will be accepted only when it actually exists.</li>
     *   </ul>
     */
    EMAIL: 42,
    /**
     * A div which can be visible or invisible contains childs. Related attributes:
     *   <ul>
     *     <li>name (string): id of parent div</li>
     *     <li>visibility (bool): whether if parent div needs to be visible or invisible</li>
     *     <li>childs (array): an array of childs; Attributes:
     *         <ul>
     *             <li>name</li>
     *             <li>displayName</li>
     *             <li>displayHint</li>
     *             <li>type: type of child</li>
     *         </ul>
     *     </li>
     *   </ul>
     */
    PARENTDIV: 43
};


/**
 * Enum for data types of stats fields
 * @readonly
 * @enum {number}
 */
JenkinsJob.STATS_FIELD_TYPE = {
    /** Not a valid type */
    NONE: 0,    
    /** An integer */
    NUMBER: 10,
    /** A decimal value that could be an integer or a floating number */
    DECIMAL: 11,
    /** A UTF-8-encoded string */
    STRING: 20,
    /** A timestamp without time zone */
    TIMESTAMP: 51
};
    

/**
 * Enum for job creation / update response.
 * @readonly
 * @enum {number}
 */
JenkinsJob.UPDATE = {
    /**
     * Will try to create/update the job configuration.<br/>
     * <em>Note:</em> It does not ensure the job will be correctly configured eventually.
     */
    OK: 1,
    /** Job creation canceled due to a name conflict */
    ALREADY_EXISTS: 2,
    /** Job update canceled because it does not exist */
    NOT_EXISTS: 3,
    /** Some error occures */
    ERROR: 99
};


/**
 * Create a new Jenkins job.<br/>
 * <em>Note:</em> NEVER call this method directly.
 * Use the corresponding "create" method provided by child classes instead.
 * @static
 * @protected
 * @param {string} jobName job name. It should not duplicate existing job names.
 * @param {string} jobType job type.
 * @param {string} jobCfgOpts options for generating job config XML
 * @param {fn} callback receives the job creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>code: creation response. Options:
 *       <ul>
 *         <li>JenkinsJob.UPDATE.OK</li>
 *         <li>JenkinsJob.UPDATE.ALREADY_EXISTS</li>
 *         <li>JenkinsJob.UPDATE.ERROR</li>
 *       </ul>
 *     </li>
 *     <li>jobName: affected job name</li>
 *   </ul>
 */
JenkinsJob._create = function(jobName, jobType, jobCfgOpts, callback) {
    return _configJob(jobName, jobType, jobCfgOpts, _configJob.OP.CREATE, callback);
};


/**
 * Get the option descriptor for the static create method<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @static
 * @abstract
 * @returns {array} an array of option descriptor. Attributes of each descriptor:
 *   <ul>
 *     <li>name (string): the option name;
 *       use it as the key to pass this option to the plugin.</li>
 *     <li>displayName (string): the text to display to users</li>
 *     <li>required (boolean, optional): whether this option is manditory;
 *       when not given or evaluates as false: this option could be absent;
 *       when evaluates as true: this option should be always passed to the plugin.</li>
 *     <li>defaultValue (string or numeric, optional): the default value presented to users</li>
 *     <li>type (numeric): the option type.<br/>
 *       See {@link JenkinsJob.DESCRIPTOR_TYPE} for more information.
 *       More related attributes may be also present depending on the option type.</li>
 *   </ul>
 */
JenkinsJob.getCreateOptionsDescriptor = function() {
    var err = Error('JenkinsJob.getCreateOptionsDescriptor should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Validate the options for the static create method<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @static
 * @abstract
 * @returns {object} validation results. Attributes:
 *   <ul>
 *     <li>result (boolean): validation results</li>
 *     <li>message (string): the message when an error is detected</li>
 *   </ul>
 */
JenkinsJob.validateCreateOptions = function(opts) {
    var err = Error('JenkinsJob.getCreateOptions should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Update Jenkins job configuration<br/>
 * <em>Note:</em> NEVER call this method directly.
 * Use the corresponding "update" method provided by child classes instead.
 * @protected
 * @param {string} jobCfgOpts options for generating job config XML
 * @param {fn} callback receives the job update response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>code: update response. Options:
 *       <ul>
 *         <li>JenkinsJob.UPDATE.OK</li>
 *         <li>JenkinsJob.UPDATE.NOT_EXISTS</li>
 *         <li>JenkinsJob.UPDATE.ERROR</li>
 *       </ul>
 *     </li>
 *     <li>jobName: affected job name</li>
 *   </ul>
 */
JenkinsJob.prototype._update = function(jobCfgOpts, callback) {
    var self = this;  // for accesing the job instance in nested functions
    var jobName = self._name;
    var jobType = self._type;
    return _configJob(jobName, jobType, jobCfgOpts, _configJob.OP.UPDATE, callback);
};


/**
 * Update Jenkins job configuration<br/>
 * <em>Note:</em> This function should be implemented in the subclasses.
 * @abstract
 * @param {Object} opts job settings. Attributes are to be defined in the subclasses.
 * @param {fn} callback receives the job update response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>code: update response. Options:
 *       <ul>
 *         <li>JenkinsJob.UPDATE.OK</li>
 *         <li>JenkinsJob.UPDATE.NOT_EXISTS</li>
 *         <li>JenkinsJob.UPDATE.ERROR</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.update = function(opts, callback) {
    var err = Error('JenkinsJob#update should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Get the option descriptor for the update method<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @static
 * @abstract
 * @returns {array} an array of option descriptor. Attributes of each descriptor:
 *   <ul>
 *     <li>name (string): the option name;
 *       use it as the key to pass this option to the plugin.</li>
 *     <li>displayName (string): the text to display to users</li>
 *     <li>required (boolean, optional): whether this option is manditory;
 *       when not given or evaluates as false: this option could be absent;
 *       when evaluates as true: this option should be always passed to the plugin.</li>
 *     <li>defaultValue (string or numeric, optional): the default value presented to users</li>
 *     <li>type (numeric): the option type.<br/>
 *       See {@link JenkinsJob.DESCRIPTOR_TYPE} for more information.
 *       More related attributes may be also present depending on the option type.</li>
 *   </ul>
 */
JenkinsJob.getUpdateOptionsDescriptor = function() {
    var err = Error('JenkinsJob.getUpdateOptionsDescriptor should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Validate the options for the update method<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @static
 * @abstract
 * @returns {object} validation results. Attributes:
 *   <ul>
 *     <li>result (boolean): validation results</li>
 *     <li>message (string): the message when an error is detected</li>
 *   </ul>
 */
JenkinsJob.validateUpdateOptions = function(opts) {
    var err = Error('JenkinsJob.getUpdateOptions should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Enum for job trigger response.
 * @readonly
 * @enum {number}
 */
JenkinsJob.TRIGGER = {
    /**
     * Will try to schedule the run <br/>
     * <em>Note:</em> It does not ensure the run will be processed eventually.
     */
    OK: 1,
    /** Blocked due to queued or ongoing runs */
    BLOCKED: 2,
    /** Some error occures */
    ERROR: 99
};


/**
 * Try to schedule a run for the job.
 * @param {Object} opts (optional) trigger options. Attributes:
 *   <ul>
 *     <li>parameters (Object): run parameters.
 *   </ul>
 * @param {fn} callback receives the trigger response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>code: trigger response. Options:
 *       <ul>
 *         <li>JenkinsJob.TRIGGER.OK</li>
 *         <li>JenkinsJob.TRIGGER.BLOCKED</li>
 *         <li>JenkinsJob.TRIGGER.ERROR</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.triggerRun = function(opts, callback) {
    var self = this;  // for accesing the job instance in nested functions

    // Check the current runs for the job
    self.getRunStatus(function(err, runs) {
        if (err) {
            let errObj = new Error('Jenkins job get error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj, JenkinsJob.TRIGGER.ERROR);
        }
        // block the trigger if there are queued or ongoing runs
        if (runs && runs.length && (runs[0].inQueue || !runs[0].result)) {
            return callback(err, JenkinsJob.TRIGGER.BLOCKED);
        }
        // trigger the job
        var jobName = self._name;
        jenkins.job.build(jobName, function(err) {
            if (err) {
                let errObj = new Error('Jenkins job trigger error: ' + err.toString());
                logger.error(errObj);
                return callback(errObj, JenkinsJob.TRIGGER.ERROR);
            }
            logger.info('Trigger a Jenkins job: ' + jobName);
            return callback(err, JenkinsJob.TRIGGER.OK);
        });
    });
};


/**
 * Try to cancel a latest run for the job.
 * @param {fn} callback receives the cancel response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *   </ul>
 */
JenkinsJob.prototype.cancelRun = function(callback) {
    var jobName = this._name;
    var runInQueue;  // queued run
    var lastRun;  // the last run

    jenkins.job.get(jobName, function(err, data) {
        if (err) {
            let errObj = new Error('Jenkins job get error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj);
        }
        runInQueue = data.queueItem;
        lastRun = data.lastBuild;

        // Priority 1: Cancel a queued run
        if (runInQueue) {
            // calling this method results in Jenkins internal error,
            // because it uses a wrong url; I have created an issue on
            // https://github.com/silas/node-jenkins
            // update to jenkins 0.15.0 or later to fix this error
            jenkins.queue.cancel(runInQueue.id, function(err) {
                if (err) {
                    let errObj = new Error('Jenkins cancel queue error: ' + err.toString());
                    logger.error(errObj);
                    return callback(errObj);
                }
                return callback(err);
            });
        }
        else if (lastRun) {
            jenkins.build.stop(jobName, lastRun.number, function(err) {
                if (err) {
                    let errObj = new Error('Jenkins stop job error: ' + err.toString());
                    logger.error(errObj);
                    return callback(errObj);
                }
                return callback(err);
            });
        }
        else {
            return callback(err);
        }
    });
};


/**
 * Get run status of the job.
 * @param {fn} callback receives the latest run(s) of the job. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>
 *       runs: the list of latest run(s).
 *       <ul>
 *         <li>If there are queued jobs, it contains queued jobs only;</li>
 *         <li>else if there are ongoing jobs, it contains ongoing jobs only;</li>
 *         <li>else if there is any finished job, it contains the latest finished job;</li>
 *         <li>otherwise, it is an ampty list.</li>
 *       </ul>
 *       Note: aborted jobs are not returrned.<br/>
 *       Each run is a JSON object. Attributes:
 *       <ul>
 *         <li>number: run number (integer)</li>
 *         <li>queueId: queue number (integer)</li>
 *         <li>inQueue: true or false</li>
 *         <li>result: 'SUCCESS' or 'FAILURE' or null</li>
 *         <li>timestamp: start timestamp (integer)</li>
 *         <li>duration: duration in msec (integer)</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.getRunStatus = function(callback) {
    var runs;  // finished runs
    var runInQueue;  // queued run
    var result = null;
    var self = this;  // for accesing the job instance in nested functions

    async.series([
        // Get run list for the job
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
        // Get info for each run
        async.timeout(function(asyncSeriesCallback) {
            // Priority 1: queued run
            if (runInQueue) {
                var queuedRun = _getQueuedRunInfo(runInQueue);
                result = [queuedRun];
                return asyncSeriesCallback(null);
            }

            var limit = 10;  // iteration limit in map operation
            var runNumberArr = runs.map(function(aRun) {return aRun.number;});
            _mapRunInfoLimit(self._name, runNumberArr, limit, function(err, runInfoArr) {
                if (err) {
                    let errObj = new Error('Jenkins run info get error: ' + err.toString());
                    return asyncSeriesCallback(errObj);
                }
                // Priority 2: ongoing runs
                var ongoingRuns = runInfoArr.filter(function(aRunInfo) {return !aRunInfo.result;});
                if (ongoingRuns.length) {
                    result = ongoingRuns;
                    return asyncSeriesCallback(null);
                }
                // Priority 3: the last finished run (if any)
                if (runInfoArr.length) {
                    var lastFinishedRun = _getLastRun(runInfoArr);
                    result = [lastFinishedRun];
                    return asyncSeriesCallback(null);
                }
                result = [];
                return asyncSeriesCallback(null);
            });
        }, DEFAULT_TIMEOUT, 'get run status timeout')

        // Error handling
    ], function(err) {
        if (err) {
            var errName = 'models.jenkins.job JenkinsJob#getRunStatus';
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
 * Get run status history of the job.<br>
 * <em>Note:</em> This method does not retrieve complete run status history;
 * when the runs exceed the capacity, the oldest ones will be deleted.
 * @param {fn} callback receives the runs of the job. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>
 *       runs: the list of run history in the following order:
 *       <ul>
 *         <li>Queued runs preceed ongoing runs or finished runs.</li>
 *         <li>The order of queued runs is undefined.</li>
 *         <li>Ongoing runs or finished runs are sorted by number's decreasingly.</li>
 *       </ul>
 *       Note: aborted jobs are not returrned.<br/>
 *       Each run is a JSON object. Attributes:
 *       <ul>
 *         <li>number: run number (integer)</li>
 *         <li>queueId: queue number (integer)</li>
 *         <li>inQueue: true or false</li>
 *         <li>result: 'SUCCESS' or 'FAILURE' or null</li>
 *         <li>timestamp: start timestamp (integer)</li>
 *         <li>duration: duration in msec (integer)</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.getRunStatusHistory = function(callback) {
    var runs;  // finished runs
    var runInQueue;  // queued run
    var result = null;  // run status history (value to return)
    var self = this;  // for accesing the job instance in nested functions

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
            var limit = null;  // no iteration limit in map operation
            var runNumberArr = runs.map(function(aRun) {return aRun.number;});
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
            var errName = 'models.jenkins.job JenkinsJob#getRunStatusHistory';
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
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *   </ul>
 * @param {fn} callback receives the latest run log of the job. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>
 *       log: the latest run log (string).
 *       <ul>
 *         <li>If runNumber is specified, it is the log of the specified run when the run record exists;</li>
 *         <li>else if there are queued jobs, it is an empty string;</li>
 *         <li>else if there are ongoing jobs, it is the current log of the latest ongoing run;</li>
 *         <li>else if there is any finished job, it the complete log of the latest finished run;</li>
 *         <li>otherwise, it returns an error.</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.getRunLog = function(opts, callback) {
    var jobName = this._name;
    var runInQueue;  // queued run
    var runNumber;
    var runLog = '';
    async.series([
        // Get run number
        async.timeout(function(asyncSeriesCallback) {
            logger.debug('JenkinsJob#getRunLog: [' + jobName + '] get run number');
            if (opts.runNumber) {
                if (!Number.isInteger(opts.runNumber) || opts.runNumber <= 0) {
                    return asyncSeriesCallback(new Error('Invalid runNumber:' + opts.runNumber));
                }
                runNumber = opts.runNumber;
                return asyncSeriesCallback(null);
            }
            else {
                jenkins.job.get(jobName, function(err, data) {
                    if (err) {
                        return asyncSeriesCallback(new Error('Jenkins job get error: ' + err.toString()));
                    }

                    runInQueue = data.queueItem;
                    if (!runInQueue) {
                        if (!data.lastBuild) {
                            return asyncSeriesCallback(new Error('Jenkins job get error: no last build available'));
                        }
                        runNumber = data.lastBuild.number;
                    }
                    return asyncSeriesCallback(err);
                });
            }
        }, DEFAULT_TIMEOUT, 'get run number timeout'),
        // Get run log
        async.timeout(function(asyncSeriesCallback) {
            logger.debug('JenkinsJob#getRunLog: [' + jobName + '] get run log');
            if (runInQueue) {
                runLog = '';
                return asyncSeriesCallback(null);
            }
            else {
                jenkins.build.log(jobName, runNumber, function(err, runLogRet) {
                    if (err) {
                        return asyncSeriesCallback(new Error('Jenkins run log get error: ' + err.toString()));
                    }
                    runLog = runLogRet;
                    return asyncSeriesCallback(null);
                });
            }
        }, DEFAULT_TIMEOUT, 'get run log timeout')

        // Error handling
    ], function(err) {
        logger.debug('JenkinsJob#getRunLog: [' + jobName + '] op done');
        if (err) {
            var errName = 'models.jenkins.job JenkinsJob#getRunLog';
            if (err.name) errName += (' ' + err.name);
            err.name = errName;

            logger.error(err.toString());
            return callback(err);
        }
        else {
            return callback(null, runLog);
        }
    });
};


/**
 * Get the file archived in a run
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *     <li>filePath (string): the path to the target file relative to the archived directory.</li>
 *   </ul>
 * @param {fn} callback receives file. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>buffer: the buffer</li>
 *   </ul>
 */
JenkinsJob.prototype.getRunFile = function(opts, callback) {
    var jobName = this._name;
    var runNumber;
    var filePath;

    async.series([
        // Step 1: get run number
        function(asyncSeriesCallback) {
            if (opts.runNumber) {
                if (!Number.isInteger(opts.runNumber) || opts.runNumber <= 0) {
                    let err = new Error('Invalid runNumber:' + opts.runNumber);
                    return asyncSeriesCallback(err);
                }
                runNumber = opts.runNumber;
                return asyncSeriesCallback(null);
            }
            else {
                jenkins.job.get(jobName, function(err, data) {
                    if (err) {
                        let errObj = new Error('Jenkins job get error: ' + err.toString());
                        return asyncSeriesCallback(errObj);
                    }
                    if (!data.lastBuild) {
                        let errObj = new Error('Jenkins job get error: no last build available');
                        return asyncSeriesCallback(errObj);
                    }
                    runNumber = data.lastBuild.number;
                    return asyncSeriesCallback(null);
                });
            }
        },

        // Step 2: fetch file
        function(asyncSeriesCallback) {
            if (!opts.filePath) {
                let errObj = new Error('Invalid file path: ' + opts.filePath);
                return asyncSeriesCallback(errObj);
            }
            filePath = opts.filePath;
            archive.getFile(jobName, runNumber, filePath, callback);
            return asyncSeriesCallback(null);
        }

        // Error handling
    ], function(err) {
        if (err) {
            let errObj = new Error('Jenkins file fetching error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj);
        }
    });
};


// TODO: add file size & creation time
/**
 * Get the list of existing files archived in a run.<br/>
 * <em>Note:</em> NEVER call this method directly.
 * Use the corresponding "getRunFileList" method provided by child classes instead.
 * @static
 * @protected
 * @param {string} jobName job name
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *   </ul>
 * @param {fn} callback receives file list. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>fileList: an array of file descriptors. Descriptor attributes:
 *       <ul>
 *         <li>title (string): file title</li>
 *         <li>path (string): file path</li>
 *         <li>viewable (boolean): whether the file is viewable;
 *           when evaluates as true, this file can be viewed or downloaded by users;
 *           when evaluates as false, this file can only be downloaded by users.
 *         </li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob._getRunFileList = function(jobName, opts, callback) {
    var runNumber;

    async.series([
        // Step 1: get run number
        function(asyncSeriesCallback) {
            if (opts.runNumber) {
                if (!Number.isInteger(opts.runNumber) || opts.runNumber <= 0) {
                    let errObj = new Error('Invalid runNumber:' + opts.runNumber);
                    return asyncSeriesCallback(errObj);
                }
                runNumber = opts.runNumber;
                return asyncSeriesCallback(null);
            }
            else {
                jenkins.job.get(jobName, function(err, data) {
                    if (err) {
                        let errObj = new Error('Jenkins job get error: ' + err.toString());
                        return asyncSeriesCallback(errObj);
                    }
                    if (!data.lastBuild) {
                        let errObj = new Error('Jenkins job get error: no last build available');
                        return asyncSeriesCallback(errObj);
                    }
                    runNumber = data.lastBuild.number;
                    return asyncSeriesCallback(null);
                });
            }
        },

        // Step 2: fetch file list
        function(asyncSeriesCallback) {
            archive.getFileList(jobName, runNumber, function(err, fileListRaw) {
                if (err) {
                    return asyncSeriesCallback(new Error('Archive getFileList error: ' + err.toString()));
                }

                var fileList = fileListRaw.map(function(filePath) {
                    var fileDescriptor = {
                        title: '',
                        path: filePath,
                        viewable: false
                    };
                    return fileDescriptor;
                });
                callback(err, fileList);
                return asyncSeriesCallback(null);
            });
        }

        // Error handling
    ], function(err) {
        if (err) {
            let errObj = new Error('Jenkins file listing error: ' + err.toString());
            logger.error(errObj);
            return callback(errObj);
        }
    });
};


/**
 * Get the list of existing files archived in a run.<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @abstract
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *   </ul>
 * @param {fn} callback receives file list. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>fileList: an array of file descriptors. Descriptor attributes:
 *       <ul>
 *         <li>title (string): file title</li>
 *         <li>filePath (string): file path</li>
 *         <li>viewable (boolean): whether the file is viewable;
 *           when evaluates as true, this file can be viewed or downloaded by users;
 *           when evaluates as false, this file can only be downloaded by users.
 *         </li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.getRunFileList = function(opts, callback) {
    var err = Error('JenkinsJob.getRunFileList should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Get the list of existing statistics sources in a run.<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @abstract
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *   </ul>
 * @param {fn} callback receives file list. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>statsList: an array of statistics descriptors. Descriptor attributes:
 *       <ul>
 *         <li>title (string): statistics title</li>
 *         <li>id (Object): statistics identifier;
 *           this identifier is used in {@link JenkinsJob#getRunStats}.</li>
 *         <li>fieldNames (array): array of strings representing field names</li>
 *         <li>fieldTypes (array): array of field data types.
 *           See {@link JenkinsJob.STATS_FIELD_TYPE} for more information.</li>
 *         <li>fieldUnits (array): array of strings representing field units;
 *           an unspecified unit will be represented by null or ''</li>
 *         <li>fieldIndices (array): array of index field numbers;<br/>
 *           E.g., [] means no index fields,
 *           [0] means the 1st field is an index,
 *           [0, 1] means either the 1st or the 2nd fields can be considered an index</li>
 *         <li>fieldProportion (array): array of fields numbers;
 *           these fields can be grouped together as proportion data.
 *           E.g., [] means no fields are grouped together,
 *           [1, 2, 3] means the 2nd, the 3rd, and the 4th fields can be grouped together.</li>
 *         <li>multiple (boolean): multiple rows;
 *           when it evaulates as true, the returned stats will be an array conatining rows,
 *           where each row is an array containing fields;
 *           when it evaluates as false, the returned stats will be an array containing fields.</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.getRunStatsList = function(opts, callback) {
    var err = Error('JenkinsJob.getRunStatsList should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Get statistics in a run.<br/>
 * <em>Note:</em> This method should be implemented in the subclasses.
 *
 * @abstract
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *     <li>statsId (Object): the statistics id</li>
 *   </ul>
 * @param {fn} callback receives the statistics. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>stats: the specified statistics.
 *       The format depends upon the corresponding statistics descriptor.</li>
 *     <li>statsInfo: the descriptor of the specified statistics.</li>
 *   </ul>
 */
JenkinsJob.prototype.getRunStats = function(opts, callback) {
    var err = Error('JenkinsJob.getRunStats should not be called directly in this object!');
    logger.error(err.toString());
};


/**
 * Get statistics data points in a run.<br/>
 *
 * @param {Object} opts options. Attributes:
 *   <ul>
 *     <li>runNumber (number, optional): the run number. By default, it targets to the latest run.</li>
 *     <li>statsId (Object): the statistics id</li>
 *   </ul>
 * @param {fn} callback receives the statistics. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>statsPoints: the specified statistics data points.
 *       The format depends upon the corresponding statistics descriptor.</li>
 *     <li>statsInfo: the descriptor of the specified statistics. Attributes:
 *       <ul>
 *         <li>fieldNames (array): array of strings representing field names</li>
 *         <li>fieldTypes (array): array of field data types.
 *           See {@link JenkinsJob.STATS_FIELD_TYPE} for more information.</li>
 *         <li>fieldUnits (array): array of strings representing field units;
 *           an unspecified unit will be represented by null or ''</li>
 *         <li>fieldProportion (array): array of fields numbers;
 *           these fields can be grouped together as proportion data.
 *           E.g., [] means no fields are grouped together,
 *           [1, 2, 3] means the 2nd, the 3rd, and the 4th fields can be grouped together.</li>
 *         <li>dimension (number): dimension of data points;
 *           when it equals 2, the returnned statsPoints will be formatted like
 *           [{x: 'fieldName 1', y: 'y value 1'}, {x: 'fieldName 2', y: 'y value 2'}...];
 *           when it equals 3, the returnned statsPoints will be formatted like
 *           [{z: 'fieldName 1', x: 'x value 1-1', y: 'y value 1-1'},
 *           {z: 'fieldName 1', x: 'x value 1-2', y: 'y value 1-2'}...,
 *           {z: 'fieldName 2', x: 'x value 2-1', y: 'y value 1-2'},
 *           {z: 'fieldName 2', x: 'x value 2-2', y: 'y value 2-2'},...].</li>
 *       </ul>
 *     </li>
 *   </ul>
 */
JenkinsJob.prototype.getRunStatsPoints = function(opts, callback) {

    function onError(err) {
        var errName = 'models.jenkins.job JenkinsJob#getRunStatsPoints';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return callback(err);
    }

    this.getRunStats(opts, function(err, stats, statsInfo) {
        if (err) return onError(err);

        var statsPoints = [];
        statsInfo.dimension = statsInfo.multiple? 3 : 2;
        if (!stats || !Array.isArray(stats) || !stats.length) return callback(err, statsPoints, statsInfo);

        var indexFields = statsInfo.fieldIndicies;  // index fields (candidates for x-axis)
        var nonindexFields = [];  // non-index fields (candidates for y-axis)
        for (var fieldIdx=0; fieldIdx<statsInfo.fieldNames.length; ++fieldIdx) {
            if (indexFields.indexOf(fieldIdx) < 0) nonindexFields.push(fieldIdx);
        }

        // multiple rows
        if (statsInfo.multiple) {
            // the first index field
            var xIdx = indexFields.length? statsInfo.fieldIndicies[0] : 0;

            for (var rowIdx=0; rowIdx<stats.length; ++rowIdx) {
                for (var yIdx of nonindexFields) {
                    statsPoints.push({
                        z: statsInfo.fieldNames[yIdx],
                        x: stats[rowIdx][xIdx],
                        y: stats[rowIdx][yIdx]
                    });
                }
            }
        }
        // single row
        else {
            for (var idx of nonindexFields) {
                statsPoints.push({
                    x: statsInfo.fieldNames[idx],
                    y: stats[idx]
                });
            }
        }

        return callback(err, statsPoints, statsInfo);
    });
};


// TODO: garbage collection of unused workspaces
/**
 * Delete a Jenkins job
 * <br><em>Note:</em> This operation CANNOT be UNDONE. Use with caution!
 * @param {Object} opts reserved for future use
 * @param {fn} callback receives response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *   </ul>
 */
JenkinsJob.prototype.delete = function(opts, callback) {

    function onError(err) {
        var errName = 'models.jenkins.job JenkinsJob#delete';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return callback(err);
    }

    var jobName = this._name;
    var jobModel;

    async.series([
        // read job from db
        function(asyncSeriesCallback) {
            JenkinsJobModel.findById(jobName, function(err, jobModelRet) {
                if (err) {
                    return asyncSeriesCallback(new Error('Error reading job from DB: ' + err.toString()));
                }
                jobModel = jobModelRet;
                if (!jobModel) {
                    return asyncSeriesCallback(new Error('No such job in DB'));
                }
                if (jobModel.pipeline) {
                    return asyncSeriesCallback(new Error('Pipeline is not null; please remove this job from pipeline first'));
                }
                return asyncSeriesCallback(null);
            });
        },

        // delete credentials
        function(asyncSeriesCallback) {
            var jobCfgOptsOrig = JSON.parse(jobModel.opts);
            var jobCfgOpts = {};
            _makeCredentialsCmd(jobName, jobCfgOptsOrig, jobCfgOpts, function(err, cmdList) {
                if (err) return asyncSeriesCallback(err);

                if (cmdList && cmdList.length) {
                    fs.readFile(path.join(__dirname, 'credentials.groovy'), 'utf-8', function(err, data) {
                        if (err) return asyncSeriesCallback(err);
                        var jenkinsMasterURLObj = url.parse(jenkinsMasterURL);
                        postTextData(
                            jenkinsMasterURLObj.hostname,
                            jenkinsMasterURLObj.port,
                            '/scriptText',
                            {script: data + '\n' + cmdList.join('\n')},
                            function(err, response) {
                                if (err) return asyncSeriesCallback(err);
                                logger.info('Update Jenkins credentials: ' + response);
                                return asyncSeriesCallback(null, jobModel);
                            }
                        );
                    });
                }
                else {
                    return asyncSeriesCallback(null);
                }
            });
        },

        // delete job
        function(asyncSeriesCallback) {
            jenkins.job.destroy(jobName, function(err) {
                if (err) {
                    return asyncSeriesCallback(new Error('Error deleting Jenkins job: ' + err.toString()));
                }
                jobModel.remove(function(err, jobModelRet) {
                    return asyncSeriesCallback(err);
                });
            });
        }

        // Error handling
    ], function(err) {
        if (err) return onError(err);
        return callback(null);
    });
};

module.exports.JenkinsJob = JenkinsJob;

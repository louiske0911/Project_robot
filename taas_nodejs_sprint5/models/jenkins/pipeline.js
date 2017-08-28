/**
 * @fileoverview Pipeline management
 */
var databaseManagement = require('../../routes/DBM/databaseManagement');
var JenkinsJobModel = databaseManagement.JENKINSJOB_MODEL;
var JenkinsPipelineModel = databaseManagement.JENKINSPIPELINE_MODEL;
var JenkinsJob = require('./job').JenkinsJob;
var async = require('async');
var util = require('util');
var crypto = require('crypto');
var logger = require('./getLogger').logger;


/**
 * Build a Jenkins pipeline instance.
 * @classdesc Jenkins Pipeline
 * @constructor
 * @param {string} pipelineName pipeline name
 */
function JenkinsPipeline(pipelineName) {
    this._name = pipelineName;
}


/**
 * Get the jenkins pipeline name (pipeline identifier)
 *
 * @returns {string} pipeline name
 */
JenkinsPipeline.prototype.getPipelineName = function() {
    return this._name;
};


/**
 * Get pipeline list.
 * @static
 * @param {fn} callback receives the pipeline list. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>data: the list of pipeline names</li>
 *   </ul>
 */
JenkinsPipeline.getAllPipelines = function(callback) {
    JenkinsPipelineModel.find({}, '_id', function(err, docs) {
        if (err)  return new Error('JenkinsPipeline.getAllPipelines error: ' + err.toString());

        var pipelines = docs.map(function(doc) {return doc._id;});
        return callback(null, pipelines);
    });
};


/**
 * @private
 */
JenkinsPipeline._computeParentJobs = function(pipelineFlow) {
    var parentJobCurr = null;
    var parentJobs = new Map();

    for (var job of pipelineFlow) {
        parentJobs.set(job, parentJobCurr);
        parentJobCurr = job;
    }

    return parentJobs;
};


/**
 * @private
 */
function iterToArray(iter) {
    var arr = [];
    for (var nextRet=iter.next(); !nextRet.done; nextRet=iter.next()) {
        arr.push(nextRet.value);
    }
    return arr;
}


/**
 * Create or update a pipeline
 * @private
 */
JenkinsPipeline._config = function(pipelineName, pipelineFlow, continueDownstreamOnFailure, op, callback) {

    function onError(err) {
        var errName = util.format('models.jenkins.pipeline JenkinsPipeline._config (%s)', pipelineName);
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err);
        return callback(err);
    }

    var pipelineModel;
    var pipelineFlowOrig;
    var parentJobsNew;  // Map (job name => parent job name)
    var jobsNew;  // array (job name)

    if (!pipelineName) {
        return onError(new Error('Invalid pipeline name'));
    }
    if (!pipelineFlow) {
        pipelineFlow = [];
    }
    else if (!Array.isArray(pipelineFlow)){
        return onError(new Error('Invalid pipeline flow'));
    }
    if (!op) {
        return onError(new Error('Invalid op'));
    }

    // TODO: stop/disable affected jobs

    async.series([

        // read original pipeline (if present)
        function(asyncSeriesCallback) {
            JenkinsPipelineModel.findById(pipelineName, function(err, findResult) {
                if (err) return asyncSeriesCallback(new Error('Jenkins pipeline reading error: ' + err.toString()));

                pipelineModel = findResult;
                if (pipelineModel) {
                    if (op == JenkinsPipeline._config.OP.CREATE) {
                        return asyncSeriesCallback(
                            new Error(util.format('Jenkins pipeline creation error: pipeline %s already exists', pipelineName))
                        );
                    }
                    pipelineFlowOrig = JSON.parse(pipelineModel.flow);
                }
                else {
                    if (op == JenkinsPipeline._config.OP.UPDATE) {
                        return asyncSeriesCallback(
                            new Error(util.format('Jenkins pipeline update error: pipeline %s does not exist', pipelineName))
                        );
                    }
                    pipelineFlowOrig = [];
                }

                // compute parent jobs
                parentJobsNew = JenkinsPipeline._computeParentJobs(pipelineFlow);
                jobsNew = iterToArray(parentJobsNew.keys());

                return asyncSeriesCallback(null);
            });
        },

        // update pipeline in db
        function(asyncSeriesCallback) {
            if (pipelineModel) {
                pipelineModel.flow = JSON.stringify(pipelineFlow);
                pipelineModel.continueDownstreamOnFailure = JSON.stringify(continueDownstreamOnFailure);
            }
            else {
                pipelineModel = new JenkinsPipelineModel({
                    _id: pipelineName,
                    flow: JSON.stringify(pipelineFlow),
                    continueDownstreamOnFailure: JSON.stringify(continueDownstreamOnFailure)
                });
            }
            pipelineModel.save(function(err) {
                if (err) return asyncSeriesCallback(new Error('Jenkins pipeline update db error: ' + err.toString()));
                return asyncSeriesCallback(null);
            });
        },

        // update db: original jobs in pipline
        function(asyncSeriesCallback) {
            JenkinsJobModel.update(
                {pipeline: pipelineName},
                {pipeline: null, parent: null, continueOnParentFailure: false},
                {multi: true},
                function(err, rawResponse) {
                    if (err) return asyncSeriesCallback(new Error('Jenkins job update db error: ' + err.toString()));
                    return asyncSeriesCallback(null);
                }
            );
        },

        // update db: new jobs in pipeline
        function(asyncSeriesCallback) {
            async.eachSeries(
                jobsNew,
                function(jobName, asyncEachCallback) {
                    JenkinsJobModel.findById(jobName, function(err, jobDoc) {
                        if (err) {
                            return asyncEachCallback(new Error('Jenkins job fetch db error: ' + err.toString()));
                        }
                        let parentJob = parentJobsNew.get(jobName);
                        jobDoc.pipeline = pipelineName;
                        jobDoc.parent = parentJob;
                        jobDoc.continueOnParentFailure = (continueDownstreamOnFailure.indexOf(parentJob) >= 0);
                        jobDoc.save(function(err, doc, numAffected) {
                            if (err) return asyncEachCallback(new Error('Jenkins job update db error: ' + err.toString()));
                            return asyncEachCallback(null);
                        });
                    });
                },
                function(err) {
                    return asyncSeriesCallback(err);
                }
            );
        },

        // update jenkins job config
        function(asyncSeriesCallback) {
            async.each(
                jobsNew,
                function(jobName, asyncEachCallback) {
                    return JenkinsJob.reconfigJob(jobName, asyncEachCallback);
                },
                function(err) {
                    return asyncSeriesCallback(err);
                }
            );
        }
    ], function(err, result) {
        if (err) return onError(err);
        return callback(null, pipelineName);
    });
};


/**
 * @private
 */
JenkinsPipeline._config.OP = {
    CREATE: 1,
    UPDATE: 2
};


/**
 * Create a new name for the Jenkins pipeline. <br/>
 * <em>Note:</em> NEVER call this directly.
 * @static
 * @returns {string} new pipeline name
 * @private
 */
JenkinsPipeline.__createPipelineName = function() {
    // date part: YYYYMMDD
    var jobDateObj = new Date();
    jobDate= jobDateObj.toISOString().substr(0, 10).split('-').join('');

    // rand part: 8 hex random numbers
    var rndLen = 8;
    var rnd = crypto.randomBytes(Math.ceil(rndLen/2)).
        toString('hex').slice(0, rndLen);
    var pipelineName = util.format('Pipeline-%s-%s', jobDate, rnd);

    return pipelineName;
};


/**
 * Create a new Jenkins pipeline
 * @static
 * @param {array} pipelineFlow pipeline flow spec
 * @param {array} continueDownstreamOnFailure continue to run their downstream jobs even when build fails
 * @param {fn} callback receives the pipeline creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>pipelineName: the new pipeline name</li>
 *   </ul>
 */
JenkinsPipeline.create = function(pipelineFlow, continueDownstreamOnFailure, callback) {
    var pipelineName = JenkinsPipeline.__createPipelineName();
    JenkinsPipeline._config(
        pipelineName,
        pipelineFlow,
        continueDownstreamOnFailure,
        JenkinsPipeline._config.OP.CREATE,
        callback
    );
};


/**
 * Update Jenkins pipeline configuration<br/>
 * @param {Array} pipelineFlow pipeline flow spec
 * @param {Array} continueDownstreamOnFailure continue to run their downstream jobs even when build fails
 * @param {Function} callback receives the pipeline creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>pipelineName: the affected pipeline name</li>
 *   </ul>
 */
JenkinsPipeline.prototype.update = function(pipelineFlow, continueDownstreamOnFailure, callback) {
    var pipelineName = this._name;
    JenkinsPipeline._config(
        pipelineName,
        pipelineFlow,
        continueDownstreamOnFailure,
        JenkinsPipeline._config.OP.UPDATE,
        callback
    );
};


/**
 * Try to schedule a run for the pipeline.
 * <br/>This effectively triggers a run for the first job in the pipeline.
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
JenkinsPipeline.prototype.triggerRun = function(opts, callback) {

    function onError(err) {
        var errName = 'models.jenkins.pipeline JenkinsPipeline#triggerRun';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return callback(err);
    }

    var self = this;
    var pipelineName = self._name;

    // read the pipeline flow from db
    JenkinsPipelineModel.findById({_id: pipelineName}, function(err, pipelineModel) {
        if (err) return onError(new Error('Error reading pipeline from db: ' + err.toString()));
        if (!pipelineModel) return onError(new Error('No corresponding pipeline record in db'));

        // trigger the first job in the pipeline flow
        var pipelineFlow = JSON.parse(pipelineModel.flow);
        if (pipelineFlow && Array.isArray(pipelineFlow) && pipelineFlow.length) {
            var jobName = pipelineFlow[0];
            var job = new JenkinsJob(jobName);
            job.triggerRun({}, callback);
        }
    });
};


/**
 * Delete a Jenkins pipeline
 * <br><em>Note:</em> This operation deletes the pipeline alone;
 * the containing jobs are not deleted.
 * <br><em>Note:</em> This operation CANNOT be UNDONE. Use with caution!
 * @param {Object} opts reserved for future use
 * @param {Function} callback receives response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *   </ul>
 */
JenkinsPipeline.prototype.delete = function(opts, callback) {

    function onError(err) {
        let errName = 'models.jenkins.pipeline JenkinsPipeline#delete';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return callback(err);
    }

    let self = this;
    let pipelineName = self._name;

    // remove jobs from the pipeline
    self.update([], [], function(err) {
        if (err) return onError(new Error('Error removing jobs from pipeline: ' + err.toString()));

        // remove pipeline from db
        JenkinsPipelineModel.remove({_id: pipelineName}, function(err) {
            if (err) return onError(new Error('Error deleting pipeline from db: ' + err.toString()));
            return callback(null);
        });
    });
};


module.exports.JenkinsPipeline = JenkinsPipeline;

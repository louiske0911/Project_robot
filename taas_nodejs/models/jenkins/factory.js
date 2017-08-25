/**
 * @fileoverview Jenkins plugin listing and object creation
 */
var fs = require('fs');
var path = require('path');
var JenkinsJob = require('./job').JenkinsJob;
var logger = require('./getLogger').logger;

var __pluginsObj;  // plugin info


// lazy load plugins info
function __getPlugins() {
    if (!__pluginsObj) {
        try {
            var pluginsRaw = fs.readFileSync(path.join(__dirname, 'plugins.json'), {encoding: 'utf8'});
            __pluginsObj = JSON.parse(pluginsRaw);
        } catch (err) {
            __pluginsObj = err;
            return err;
        }
    }

    return __pluginsObj;
}


function __findPlugin(jobType) {
    try {
        // get plugins info
        var pluginsObj = __getPlugins();
        if (pluginsObj instanceof Error) {
            throw new Error('Plugins loading failure');
        }

        // find plugin based upon jobType
        var pluginEle = pluginsObj.find(function(element) { return element.type == jobType;});
        if (!pluginEle) {
            throw new Error('src is undefined for job type=' + jobType);
        }

        return pluginEle;
    } catch (err) {
        return err;
    }
}


/**
 * Build a Jenkins factory instance<br/>
 * It is seldom needed to build an instance of this class;
 * call its static utility functions directly.
 * @classdesc Jenkins factory main class for listing and instantiating Jenkins job plugins.
 *   It is a utility function that provides a set of static functions.
 * @constructor
 */
function JenkinsFactory() {
}


/**
 * Get all the installed Jenkins job plugins
 *
 * @static
 * @returns {array} a list of available Jenkins job plugins or an error object. Attributes of a plugin:
 *   <ul>
 *     <li>type (string): Jenkins job type (plugin name)</li>
 *     <li>src (string): plugin source path</li>
 *     <li>version (string): plugin version</li>
 *   </ul>
 */
JenkinsFactory.getAllPlugins = function() {
    return __getPlugins();
};


/**
 * Create a new Jenkins Selenium Job.
 *
 * @static
 * @param {string} jobType job type
 * @param {Object} opts job settings
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
 *     <li>jobName: the new job name</li>
 *   </ul>
 */
JenkinsFactory.createJob = function(jobType, opts, callback) {

    function onError(err) {
        var errName = 'models.jenkins.factory createJob';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return callback(err, JenkinsJob.UPDATE.ERROR);
    }

    try {
        var pluginEle = __findPlugin(jobType);
        if (pluginEle instanceof Error) {
            throw pluginEle;
        }
        var module = require(path.join(__dirname, pluginEle.src));
        return module.staticCreate(opts, callback);
    } catch (err) {
        return onError(err);
    }
};


/**
 * Initialize a Jenkins job instance.
 *
 * @static
 * @param {string} jobType job type
 * @param {string} jobName job name (job identifier)
 * @returns {JenkinsJob} a new instance of the specified job type or an error object
 */
JenkinsFactory.buildJobInstance = function(jobType, jobName) {

    function onError(err) {
        var errName = 'models.jenkins.factory buildJobInstance';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return err;
    }

    try {
        var pluginEle = __findPlugin(jobType);
        if (pluginEle instanceof Error) {
            throw pluginEle;
        }
        var module = require(path.join(__dirname, pluginEle.src));
        return new module.constructor(jobName);
    } catch (err) {
        return onError(err);
    }
};


/**
 * Get a Jenkins job class reference.
 *
 * @static
 * @param {string} jobType job type
 * @returns {JenkinsJob} the job class reference
 */
JenkinsFactory.getJobClass = function(jobType) {

    function onError(err) {
        var errName = 'models.jenkins.factory getJobClass';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return err;
    }

    try {
        var pluginEle = __findPlugin(jobType);
        if (pluginEle instanceof Error) {
            throw pluginEle;
        }
        var module = require(path.join(__dirname, pluginEle.src));
        return module.constructor;
    } catch (err) {
        return onError(err);
    }
};


exports.JenkinsFactory = JenkinsFactory;

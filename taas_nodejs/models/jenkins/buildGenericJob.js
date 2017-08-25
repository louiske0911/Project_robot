/**
 * @fileoverview Jenkins integration for generic build support
 */
var util = require('util');
var path = require('path');
var validator = require('validator');
var logger = require('./getLogger').logger;
var JenkinsJob = require('./job').JenkinsJob;

const JOB_TYPE = 'build/generic';
const JOB_PREFIX = 'BuildGeneric';
const JOB_SLAVE = 'taas && base';
const FULL_JOB_NAME = 'Jenkins Build Generic Job';

/**
 * Build a Jenkins Build Generic job instance.
 * @classdesc Jenkins Build Generic job
 * @constructor
 * @extends JenkinsJob
 * @param {String} jobName job name
 */
function JenkinsBuildGenericJob(jobName) {
    // call the parent constructor
    JenkinsJob.call(this, jobName);
    this._type = JOB_TYPE;
}

// inherit from JenkinsJob
util.inherits(JenkinsBuildGenericJob, JenkinsJob);


/**
 * Create a new name for Jenkins Build Generic job. <br/>
 * @returns {string} new job name
 * @private
 */
function gitCreateJobName() {
    return JenkinsJob._createJobName(JOB_PREFIX);
}


/**
 * Create the Jenkins job configuration options
 * @private
 * @static
 * @param {Object} opts job settings. See {@link JenkinsBuildGenericJob.getCreateOptionsDescriptor} for more info.
 * @param {string} jobName job name
 * @param {fn} callback receives the job creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>jobCfgOpts: an object representing Jenkins job XML configuration options</li>
 *   </ul>
 */
JenkinsBuildGenericJob.__createJobCfg = function(opts, jobName, callback) {

    function onError(err) {
        logger.debug(err);
        return callback(err);
    }

    function getErrOptions(optValidation) {
        var errorOpts = optValidation.map(function(val) {return val.name;});
        return errorOpts.join(',');
    }

    var optValidation = JenkinsBuildGenericJob.__validateCreateOptions(opts);
    if (optValidation.length) {
        return onError(new Error('Validation error for options ' + getErrOptions(optValidation)));
    }

    var cmd = JenkinsBuildGenericJob.__createJobCommands(opts);

    var cfgOpts = {
        description: 'This job is generated by TaaS::JenkinsBuildGenericJob.',
        assignedNode: JOB_SLAVE,
        builders: [
            {
                type: 'shell',
                command: cmd
            }
        ]
    };
    return callback(null, cfgOpts);
};


// TODO: chroot or jail
/**
 * Create build commands
 * @private
 * @returns {string} the commands as a string or an error object
 */
JenkinsBuildGenericJob.__createJobCommands = function(opts) {
    if (opts.buildScript) {
        return './' + opts.buildScript;
    }
    else {
        var buildCmds = ['buildScript='];
        buildCmds.push('if [ -f build.sh ]; then buildScript="build.sh"');
        buildCmds.push('elif [ -f build.py ]; then buildScript="build.py"');
        buildCmds.push('else');
        buildCmds.push('echo "Build script is not found!"');
        buildCmds.push('exit 1');
        buildCmds.push('fi');
        buildCmds.push('if [ "$buildScript" ]; then "./$buildScript"');
        buildCmds.push('fi');
        return buildCmds.join('\n');
    }
};


/**
 * Create a new Jenkins Build Generic Job.
 * @static
 * @param {Object} opts job settings. See {@link JenkinsBuildGenericJob.getCreateOptionsDescriptor} for more info.
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
JenkinsBuildGenericJob.create = function(opts, callback) {
    var jobName = gitCreateJobName();
    JenkinsBuildGenericJob.__createJobCfg(opts, jobName, function(err, jobCfgOpts) {
        if (err) {
            var errObj = new Error(FULL_JOB_NAME + ' creation error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, JenkinsJob.UPDATE.ERROR);
        }
        return JenkinsJob._create(jobName, JOB_TYPE, jobCfgOpts, callback);
    });
};


const OPTIONS_DESCRIPTOR = [
    {
        name: 'buildScript',
        displayName: 'Build script',
        displayHint: 'Build script path',
        type: JenkinsJob.DESCRIPTOR_TYPE.PATH
    }
];


/**
 * Get the option descriptor for the static create method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsBuildGenericJob.getCreateOptionsDescriptor = function() {
    return OPTIONS_DESCRIPTOR;
};


/**
 * Get the option descriptor for the update method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsBuildGenericJob.getUpdateOptionsDescriptor = function() {
    return OPTIONS_DESCRIPTOR;
};


/**
 * @private
 */
JenkinsBuildGenericJob.__validateCreateOptions = function(opts) {

    // TODO: robust file path validation
    var relFilePathRE = new RegExp('^[^/;:|~&`\'"][^;:|~&`\'"]*$');  // forbid these characters
    function testFilePath(filePath) {
        // contains forbidden characters
        if (!relFilePathRE.test(filePath)) return false;
        // escapes the current working directory
        if (path.normalize(filePath).indexOf('../') >= 0 ) return false;
        return true;
    }

    var errors = [];

    if (opts.buildScript && !testFilePath(opts.buildScript)) {
        errors.push({
            name: 'buildScript',
            err: new Error('Invalid build script path')
        });
    }

    return errors;
};


/**
 * Validate the options for the static create method<br/>
 *
 * @static
 * @returns {object} validation results. Attributes:
 *   <ul>
 *     <li>result (boolean): validation results</li>
 *     <li>message (string): the message when an error is detected</li>
 *   </ul>
 */
JenkinsBuildGenericJob.validateCreateOptions = function(opts) {
    return JenkinsBuildGenericJob.__validateCreateOptions(opts);
};


/**
 * Validate the options for the update method<br/>
 *
 * @static
 * @returns {object} validation results. Attributes:
 *   <ul>
 *     <li>result (boolean): validation results</li>
 *     <li>message (string): the message when an error is detected</li>
 *   </ul>
 */
JenkinsBuildGenericJob.validateUpdateOptions = function(opts) {
    return JenkinsBuildGenericJob.__validateCreateOptions(opts);
};


/**
 * Update Jenkins job configuration.
 * @param {Object} opts job settings. See {@link JenkinsBuildGenericJob.getCreateOptionsDescriptor} for more info.
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
JenkinsBuildGenericJob.prototype.update = function(opts, callback) {
    var self = this;
    JenkinsBuildGenericJob.__createJobCfg(opts, self._name, function(err, jobCfgOpts) {
        if (err) {
            var errObj = new Error(FULL_JOB_NAME + ' update error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, JenkinsJob.UPDATE.ERROR);
        }
        return self._update(jobCfgOpts, callback);
    });
};


JenkinsBuildGenericJob.prototype.getRunFileList = function(opts, callback) {
    // no run files
    return callback(null, []);
};


JenkinsBuildGenericJob.prototype.getRunStatsList = function(opts, callback) {
    // no run statistics
    return callback(null, []);
};


JenkinsBuildGenericJob.prototype.getRunStats = function(opts, callback) {
    return callback(new Error('No run statistics available'));
};


module.exports.JenkinsBuildGenericJob = JenkinsBuildGenericJob;
module.exports.staticCreate = JenkinsBuildGenericJob.create;
module.exports.constructor = JenkinsBuildGenericJob;

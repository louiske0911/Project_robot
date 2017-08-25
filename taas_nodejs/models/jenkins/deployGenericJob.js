/**
 * @fileoverview Jenkins integration for generic deployment support
 */
var util = require('util');
var path = require('path');
var validator = require('validator');
var logger = require('./getLogger').logger;
var JenkinsJob = require('./job').JenkinsJob;
var config = require('../../lib/config.js');
var libPath = require('./libPath');

const JOB_TYPE = 'deploy/generic';
const JOB_PREFIX = 'DeployGeneric';
const JOB_SLAVE = 'taas && base';
const FULL_JOB_NAME = 'Jenkins Deploy Generic Job';
const RUNFILE_NAME = 'deploy_result.txt';

/**
 * Build a Jenkins Deploy Generic job instance.
 * @classdesc Jenkins Deploy Generic job
 * @constructor
 * @extends JenkinsJob
 * @param {String} jobName job name
 */
function JenkinsDeployGenericJob(jobName) {
    // call the parent constructor
    JenkinsJob.call(this, jobName);
    this._type = JOB_TYPE;
}

// inherit from JenkinsJob
util.inherits(JenkinsDeployGenericJob, JenkinsJob);


/**
 * Create a new name for Jenkins Deploy Generic job. <br/>
 * @returns {string} new job name
 * @private
 */
function gitCreateJobName() {
    return JenkinsJob._createJobName(JOB_PREFIX);
}


// TODO
/**
 * Create the Jenkins job configuration options
 * @private
 * @static
 * @param {Object} opts job settings. See {@link JenkinsDeployGenericJob.getCreateOptionsDescriptor} for more info.
 * @param {string} jobName job name
 * @param {fn} callback receives the job creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>jobCfgOpts: an object representing Jenkins job XML configuration options</li>
 *   </ul>
 */
JenkinsDeployGenericJob.__createJobCfg = function(opts, jobName, callback) {

    function onError(err) {
        logger.debug(err);
        return callback(err);
    }

    function getErrOptions(optValidation) {
        var errorOpts = optValidation.map(function(val) {return val.name;});
        return errorOpts.join(',');
    }

    var optValidation = JenkinsDeployGenericJob.__validateCreateOptions(opts);
    if (optValidation.length) {
        return onError(new Error('Validation error for options ' + getErrOptions(optValidation)));
    }

    var cmd = JenkinsDeployGenericJob.__createJobCommands(opts);

    var cfgOpts = {
        description: 'This job is generated by TaaS::JenkinsDeployGenericJob.',
        assignedNode: JOB_SLAVE,
        builders: [
            {
                type: 'shell',
                command: cmd
            }
        ],
        buildWrappers: [
            {
                type: 'archive',
                configName: 'Archive server',
                remoteDirectory: 'archive_root/${JOB_NAME}/${BUILD_NUMBER}',
                sourceFiles: RUNFILE_NAME,
                execTimeout: 120000
            }
        ],
    };
    return callback(null, cfgOpts);
};


// TODO: chroot or jail
/**
 * Create build commands
 * @private
 * @returns {string} the commands as a string or an error object
 */
JenkinsDeployGenericJob.__createJobCommands = function(opts) {
    var buildCmds = ['unset deployCfg'];
    buildCmds.push('jobName="$JOB_NAME"');

    if (opts.deployCfg) {
        buildCmds.push('deployCfg="' + opts.deployCfg + '"');
    }
    else {
        buildCmds.push('if [ -f deploy.sh ]; then deployCfg="deploy.sh"');
        buildCmds.push('elif [ -f deploy.py ]; then deployCfg="deploy.py"');
        buildCmds.push('else');
        buildCmds.push('echo "Deploy configuration file is not found!"');
        buildCmds.push('exit 1');
        buildCmds.push('fi');
    }

    buildCmds.push('echo "job id = $jobName"');
    buildCmds.push('echo "deploy configuration file = $deployCfg"');
    buildCmds.push(util.format('~/%s/AutoDeploy.sh "$jobName" "$deployCfg" "%s" "%s"',
        libPath.deployment_lib,
        config.get('resource_management_server'),
        opts.projID
    ));
    return buildCmds.join('\n');
};


/**
 * Create a new Jenkins Build Generic Job.
 * @static
 * @param {Object} opts job settings. See {@link JenkinsDeployGenericJob.getCreateOptionsDescriptor} for more info.
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
JenkinsDeployGenericJob.create = function(opts, callback) {
    var jobName = gitCreateJobName();
    JenkinsDeployGenericJob.__createJobCfg(opts, jobName, function(err, jobCfgOpts) {
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
        name: 'deployCfg',
        displayName: 'Deploy config',
        displayHint: 'Deployment configuration file path',
        type: JenkinsJob.DESCRIPTOR_TYPE.PATH
    }
];


/**
 * Get the option descriptor for the static create method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsDeployGenericJob.getCreateOptionsDescriptor = function() {
    return OPTIONS_DESCRIPTOR;
};


/**
 * Get the option descriptor for the update method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsDeployGenericJob.getUpdateOptionsDescriptor = function() {
    return OPTIONS_DESCRIPTOR;
};


/**
 * @private
 */
JenkinsDeployGenericJob.__validateCreateOptions = function(opts) {

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

    if (opts.deployCfg && !testFilePath(opts.deployCfg)) {
        errors.push({
            name: 'deployCfg',
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
JenkinsDeployGenericJob.validateCreateOptions = function(opts) {
    return JenkinsDeployGenericJob.__validateCreateOptions(opts);
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
JenkinsDeployGenericJob.validateUpdateOptions = function(opts) {
    return JenkinsDeployGenericJob.__validateCreateOptions(opts);
};


/**
 * Update Jenkins job configuration.
 * @param {Object} opts job settings. See {@link JenkinsDeployGenericJob.getCreateOptionsDescriptor} for more info.
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
JenkinsDeployGenericJob.prototype.update = function(opts, callback) {
    var self = this;
    JenkinsDeployGenericJob.__createJobCfg(opts, self._name, function(err, jobCfgOpts) {
        if (err) {
            var errObj = new Error(FULL_JOB_NAME + ' update error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, JenkinsJob.UPDATE.ERROR);
        }
        return self._update(jobCfgOpts, callback);
    });
};


JenkinsDeployGenericJob.prototype.getRunFileList = function(opts, callback) {
    var self = this;
    var jobName = self._name;

    return JenkinsJob._getRunFileList(jobName, opts, function(err, fileList) {
        if (err) {
            return callback(new Error(FULL_JOB_NAME + ' getRunFileList error: ' + err.toString()));
        }

        var fileDescriptorList = [];

        for (var idx=0; idx<fileList.length; ++idx) {
            var fileDescriptor = fileList[idx];
            var filePath = fileDescriptor.path;
            if (filePath == RUNFILE_NAME) {
                fileDescriptor.title = 'Deploy results';
                fileDescriptor.viewable = true;
                fileDescriptorList.push(fileDescriptor);
            }
        }

        return callback(err, fileDescriptorList);
    });
};


JenkinsDeployGenericJob.prototype.getRunStatsList = function(opts, callback) {
    // no run statistics
    return callback(null, []);
};


JenkinsDeployGenericJob.prototype.getRunStats = function(opts, callback) {
    return callback(new Error('No run statistics available'));
};


module.exports.JenkinsDeployGenericJob = JenkinsDeployGenericJob;
module.exports.staticCreate = JenkinsDeployGenericJob.create;
module.exports.constructor = JenkinsDeployGenericJob;

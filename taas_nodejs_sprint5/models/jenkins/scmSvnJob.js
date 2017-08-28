/**
 * @fileoverview Jenkins integration for Subversion support
 */
var util = require('util');
var path = require('path');
var validator = require('validator');
var logger = require('./getLogger').logger;
var JenkinsJob = require('./job').JenkinsJob;

const SVN_JOBTYPE = 'scm/svn';
const SVN_JOBPREFIX = 'ScmSvn';
const SVN_JOBSLAVE = 'taas && base';

/**
 * Build a Jenkins SCM Subversion job instance.
 * @classdesc Jenkins SCM Subversion job
 * @constructor
 * @extends JenkinsJob
 * @param {String} jobName job name
 */
function JenkinsScmSvnJob(jobName) {
    // call the parent constructor
    JenkinsJob.call(this, jobName);
    this._type = SVN_JOBTYPE;
}

// inherit from JenkinsJob
util.inherits(JenkinsScmSvnJob, JenkinsJob);

/**
 * Create a new name for Jenkins SCM Subversion job. <br/>
 * @returns {string} new job name
 * @private
 */
function svnCreateJobName() {
    return JenkinsJob._createJobName(SVN_JOBPREFIX);
}


/**
 * Create the Jenkins job configuration options
 * @private
 * @static
 * @param {Object} opts job settings. See {@link JenkinsScmSvnJob.getCreateOptionsDescriptor} for more info.
 * @param {string} jobName job name
 * @param {fn} callback receives the job creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>jobCfgOpts: an object representing Jenkins job XML configuration options</li>
 *   </ul>
 */
JenkinsScmSvnJob.__createJobCfg = function(opts, jobName, callback) {

    function onError(err) {
        logger.debug(err);
        return callback(err);
    }

    var cfgOpts = {
        description: 'This job is generated by TaaS::JenkinsScmSvnJob.',
        assignedNode: SVN_JOBSLAVE,
        scm: {
            svn : {
                url: opts.repoURL
            }
        }
    };

    // support credentials
    if (opts.username && opts.privateKey) {
        cfgOpts._credentials = [{
            idSuffix: '',
            username: opts.username,
            privateKey: opts.privateKey
        }];
        cfgOpts.scm.svn.credentialsId = jobName;
    }
    else if (opts.username) {
        cfgOpts._credentials = [{
            idSuffix: '',
            username: opts.username,
            password: opts.password
        }];
        cfgOpts.scm.svn.credentialsId = jobName;
    }
    return callback(null, cfgOpts);
};


/**
 * Create a new Jenkins SCM Subversion Job.
 * @static
 * @param {Object} opts job settings. See {@link JenkinsScmSvnJob.getCreateOptionsDescriptor} for more info.
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
JenkinsScmSvnJob.create = function(opts, callback) {
    var jobName = svnCreateJobName();
    JenkinsScmSvnJob.__createJobCfg(opts, jobName, function(err, jobCfgOpts) {
        if (err) {
            let errObj = new Error('Jenkins SCM Svn job creation error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, JenkinsJob.UPDATE.ERROR);
        }
        return JenkinsJob._create(jobName, SVN_JOBTYPE, jobCfgOpts, callback);
    });
};


const SVN_OPTIONS_DESCRIPTOR = [
    {
        name: 'repoURL',
        displayName: 'Repository URL',
        displayHint: 'Subversion repository URL',
        type: JenkinsJob.DESCRIPTOR_TYPE.URL,
        alreadyExists: true,
        required: true
    },
    {
        name: 'username',
        displayName: 'Username',
        displayHint: 'Subversion repository username. This is only needed if authentication is required.',
        type: JenkinsJob.DESCRIPTOR_TYPE.STRING,
    },
    {
        name: 'password',
        displayName: 'Password',
        displayHint: 'Subversion repository password. This is only needed if password-based authentication is required.',
        type: JenkinsJob.DESCRIPTOR_TYPE.PASSWORD,
    },
    {
        name: 'privateKey',
        displayName: 'Private key',
        displayHint: 'Subversion repository private key. This is only needed if key-based authentication is required.',
        type: JenkinsJob.DESCRIPTOR_TYPE.STRING,
        longText: true
    }
];


/**
 * Get the option descriptor for the static create method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsScmSvnJob.getCreateOptionsDescriptor = function() {
    return SVN_OPTIONS_DESCRIPTOR;
};


/**
 * Get the option descriptor for the update method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsScmSvnJob.getUpdateOptionsDescriptor = function() {
    return SVN_OPTIONS_DESCRIPTOR;
};


// TODO
/**
 * @private
 */
JenkinsScmSvnJob.__validateCreateOptions = function(opts) {
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
JenkinsScmSvnJob.validateCreateOptions = function(opts) {
    return JenkinsScmSvnJob.__validateCreateOptions(opts);
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
JenkinsScmSvnJob.validateUpdateOptions = function(opts) {
    return JenkinsScmSvnJob.__validateCreateOptions(opts);
};


/**
 * Update Jenkins job configuration.
 * @param {Object} opts job settings. See {@link JenkinsScmSvnJob.getCreateOptionsDescriptor} for more info.
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
JenkinsScmSvnJob.prototype.update = function(opts, callback) {
    var self = this;
    JenkinsScmSvnJob.__createJobCfg(opts, self._name, function(err, jobCfgOpts) {
        if (err) {
            let errObj = new Error('Jenkins SCM Subversion job update error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, JenkinsJob.UPDATE.ERROR);
        }
        return self._update(jobCfgOpts, callback);
    });
};


JenkinsScmSvnJob.prototype.getRunFileList = function(opts, callback) {
    // no run files
    return callback(null, []);
};


JenkinsScmSvnJob.prototype.getRunStatsList = function(opts, callback) {
    // no run statistics
    return callback(null, []);
};


JenkinsScmSvnJob.prototype.getRunStats = function(opts, callback) {
    return callback(new Error('No run statistics available'));
};


module.exports.JenkinsScmSvnJob = JenkinsScmSvnJob;
module.exports.staticCreate = JenkinsScmSvnJob.create;
module.exports.constructor = JenkinsScmSvnJob;
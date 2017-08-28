/**
 * @fileoverview Jenkins integration for Selenium tests
 */
var util = require('util');
var path = require('path');
var validator = require('validator');
var logger = require('./getLogger').logger;
var libPath = require('./libPath');

var job = require('./job');
var JOBTYPE = 'test/selenium';
var JOBSLAVE = 'taas && base';

/**
 * Build a Jenkins Selenium job instance.
 * @classdesc Jenkins Selenium job
 * @constructor
 * @extends JenkinsJob
 * @param {String} jobName job name
 *
 * @example <caption>Create a Jenkins Selenium job</caption>
 * var jobName = null;  // job name will be updated later
 * var jobOpts = {...};  // various job options
 * JenkinsSeleniumJob.create(jobOpts, function(err, code, name) {
 *     if (err) {...}  // error handling
 *     if (code...) {...}  // other error handling
 *     // if (code==JenkinsJob.UPDATE.OK), the job is suceessfully created
 *     jobName = name;  // get the new job name
 * });
 * @example <caption>Trigger a job</caption>
 * var jobName = '...';  // we already know the job name
 * var runOpts = {};  // assume we want to run the job without extra parameters
 * var job = new JenkinsSeleniumJob(jobName);
 * job.triggerRun(runOpts, function(err, code) {
 *     if (err) {...}  // error handling
 *     if (code...) {...}  // other error handling
 *     // if (code==JenkinsJob.TRIGGER.OK), the job is expected to run sometime later
 * });
 * @example <caption>Update the configuration of an existing job</caption>
 * var jobName = '...';  // we already know the job name
 * var jobOpts = {...};  // various job options
 * var job = new JenkinsSeleniumJob(jobName);
 * job.update(jobOpts, function(err, code) {
 *     if (err) {...}  // error handling
 *     if (code...) {...}  // other error handling
 *     // if (code==JenkinsJob.UPDATE.OK), the job configuration is updated
 * });
 * @example <caption>Get the job running status</caption>
 * var jobName = '...';  // we already know the job name
 * var job = new JenkinsSeleniumJob(jobName);
 * job.getRunStatus(function(err, runs) {
 *     if (err) {...}  // error handling
 *     // the latest run(s) of the job are stored in runs
 * });
 * @example <caption>Get the job run log</caption>
 * var jobName = '...';  // we already know the job name
 * var job = new JenkinsSeleniumJob(jobName);
 * var runOpts = {...};  // various run options
 * job.getRunLog(runOpts, function(err, log) {
 *     if (err) {...}  // error handling
 *     // the latest run log of the job is stored in log
 * });
 * @example <caption>Get the archived file contents for a job run</caption>
 * var jobName = '...';  // we already know the job name
 * var runOpts = {...};  // various run options
 * var job = new JenkinsSeleniumJob(jobName);
 * job.getRunFile(runOpts, function(err, log) {
 *     if (err) {...}  // error handling
 *     // the latest run log of the job is stored in log
 * });
 */
function JenkinsSeleniumJob(jobName) {
    // call the parent constructor
    job.JenkinsJob.call(this, jobName);
    this._type = JOBTYPE;
    this._rcFilePathMatcher = new RegExp('Selenium-RC-results-' + jobName + '-([^.]+)\.html');
    this._wdPythonFilePath = 'Selenium-WD-results-' + jobName + '.html';
    this._wdJavaJUnitFilePath = 'Selenium-WD-results-Java-JUnit-' + jobName + '.txt';
}

// inherit JenkinsJob
JenkinsSeleniumJob.prototype = new job.JenkinsJob();

// correct the constructor pointer because it points to JenkinsJob
JenkinsSeleniumJob.prototype.constructor = JenkinsSeleniumJob;


/**
 * Create a new name for Jenkins Selenium job. <br/>
 * <em>Note:</em> NEVER call this directly.
 * @static
 * @returns {string} new job name
 * @private
 */
JenkinsSeleniumJob.__createJobName = function() {
    return job.JenkinsJob._createJobName('Selenium');
};


/**
 * Enum for Selenium test script type.
 * @readonly
 * @enum {number}
 */
JenkinsSeleniumJob.SCRIPT_TYPE = {
    /** Not specifying a valid Selenium script */
    NONE: 0,
    /** Selenium RC, html file */
    RC_HTML: 10,
    /** Selenium Web Driver, Python 2 PyUnit */
    WD_PYTHON_2_PYUNIT: 30,
    /** Selenium Web Driver, Python 3 PyUnit */
    WD_PYTHON_3_PYUNIT: 31,
    /** Selenium Web Driver, Java JUnit 4 */
    WD_JAVA_JUNIT: 40
};


/**
 * Create the Jenkins job configuration options
 * @private
 * @static
 * @param {Object} opts job settings. See {@link JenkinsSeleniumJob#update} for more info.
 * @param {string} jobName job name
 * @param {fn} callback receives the job creation response. Parameters:
 *   <ul>
 *     <li>err: error object</li>
 *     <li>jobCfgOpts: an object representing Jenkins job XML configuration options</li>
 *   </ul>
 */
JenkinsSeleniumJob.__createJobCfg = function(opts, jobName, callback) {

    function onError(err) {
        logger.debug(err);
        return callback(err);
    }

    // Selenium commands
    var cmd = JenkinsSeleniumJob.__createJobCommands(opts, jobName);
    if (cmd instanceof Error) {
        return onError(new Error('command creation error: ' + cmd.toString()));
    }

    var cfgOpts = {
        description: 'This job is generated by TaaS::JenkinsSeleniumJob.',
        assignedNode: JOBSLAVE,
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
                sourceFiles: 'Selenium-*-results-*${JOB_NAME}*.html,Selenium-*-results-*${JOB_NAME}*.txt',
                execTimeout: 120000
            }
        ],
    };

    return callback(null, cfgOpts);
};


/**
 * Get initial Jenkins job commands
 * @param title task title
 * @private
 * @returns Array<string> commands
 */
JenkinsSeleniumJob.__getCommandHeaders = function(title) {
    return [
        '#!/bin/bash',  // does not enable the 'x' & 'e' shell options:
                        // does not echo commands;
                        // does not abort script at first failure
        'echo "================================"',
        'echo "' + title + '"',
        'echo "================================"',
        'echo "Clean up run files..."',
        'sudo rm -f "Selenium-*-results-*${JOB_NAME}*.html" "Selenium-*-results-*${JOB_NAME}*.txt"',
        'echo "Load env settings..."',
        'if [ -f env.properties ]; then',
        '    eval $(cat env.properties)',
        'fi'
    ];
};


/**
 * Test whether the given path is a relative file path on local disk
 * @param filePath file path to test
 * @private
 * @returns boolean test results
 */
JenkinsSeleniumJob.__testFilePath = function(filePath) {
    // TODO: robust file path validation
    let relFilePathRE = new RegExp('^[^/;:|~&`\'"][^;:|~&`\'"]*$');  // forbid these characters

    // contains forbidden characters
    if (!relFilePathRE.test(filePath)) return false;
    // escapes the current working directory
    if (path.normalize(filePath).indexOf('../') >= 0 ) return false;
    return true;
};


/**
 * Create commands for varied types of Selenium test scripts
 * @private
 * @returns (string|Object) commands as a string or an error object
 */
JenkinsSeleniumJob.__createJobCommands = function(opts, jobName) {
    var defaultXServerArgs = '-screen 0 1024x768x8';

    try {
        switch (opts.scriptType) {
            case JenkinsSeleniumJob.SCRIPT_TYPE.RC_HTML: {
                let cmdLines = this.__getCommandHeaders('Selenium RC (html)');

                let targetBaseURL = opts.targetBaseURL;
                let urlValidationOpts = {
                    protocols: ['http', 'https'],
                    require_protocol: false
                };
                if (!validator.isURL(targetBaseURL, urlValidationOpts)) {
                    throw new Error('Invalid target base url: ' + targetBaseURL);
                }

                let startScriptPath = opts.startScriptPath;
                if (!this.__testFilePath(startScriptPath)) {
                    throw new Error('Invalid start script path: ' + startScriptPath);
                }

                // output files will be "Selenium-RC-results-<jobName>-<browser>.html"
                let outputBaseName = 'Selenium-RC-results';

                let browser = 'firefox';  // support firefox only
                // generate the command (file paths are quoted to paths with spaces)

                let outputName = 'Selenium-RC-results-' + jobName + '-firefox.html';

                let cmd = util.format(
                    // (1) use the customized taas-xvfb-run.centos rather than the original xvfb-run
                    // installed from the apt/yum repositories to avoid a bug of
                    // mixing standard error and standard output messages (Ubuntu bug #1059947)
                    // (2) use the timeout option to prevent Selenium RC server from hanging due to
                    // some command's waiting or feeding it with a test case file rather than a test suite file
                    // (3) use the egd (entropy gathering daemon) option to avoid long Selenium blocking
                    //'sudo ~/selenium_lib/taas-xvfb-run.centos java -Djava.security.egd=file:///dev/urandom -jar ~/selenium_lib/selenium-server.jar -timeout 180 -userExtensions ~/selenium_lib/user-extensions.js -htmlsuite *%s %s "%s" "%s-%s-%s.html"',
                    'sudo ~/%s/taas-xvfb-run.centos -s "%s" java -Djava.security.egd=file:///dev/urandom -jar ~/%s/selenium-server.jar -timeout 180 -htmlsuite *%s %s "%s" "%s-%s-%s.html"',
                    libPath.selenium_lib,
                    defaultXServerArgs,
                    libPath.selenium_lib,
                    browser, targetBaseURL, startScriptPath,
                    outputBaseName, jobName, browser
                );
                cmdLines.push(cmd);
                cmdLines.push("runtest_ret=$?");
                // store the exit status of testing command

                if(opts.testManagementSpiraTest[0]){
                    let host, port;
                    if(opts.spiraTestHost.indexOf(":") != -1){
                        host = opts.spiraTestHost.split(':')[0];
                        port = opts.spiraTestHost.split(':')[1];
                    }else{
                        host = opts.spiraTestHost;
                        port = 80;
                    }
                    let autoCreateTestcase = "NotAutoCreateTestCase";
                    opts.SpiraTestOptions.forEach(function(option){
                        if(option == 1){
                            autoCreateTestcase = "AutoCreateTestCase";
                        }
                    });
                    let spiraTestRelease;
                    switch(opts.spiraTestRelease){
                        case 0:
                            spiraTestRelease = '" "';
                            break;
                        case 1:
                            spiraTestRelease = this.__escapeDoubleQuotes(opts.spiraTestReleaseID)+ '" "';
                            break;
                        case 2:
                            spiraTestRelease = this.__escapeDoubleQuotes(opts.spiraTestReleaseVersion)+ '" "';
                            break;
                        case 3:
                            spiraTestRelease = this.__escapeDoubleQuotes(opts.spiraTestReleaseName) + '" "' + this.__escapeDoubleQuotes(opts.spiraTestReleaseVersion);
                            break;
                    }
                    let suppresslevel = opts.FolderSuppressLevel.toString();
                    let pattern = this.__escapeDoubleQuotes(opts.TestCaseNamePattern);
                    let replace = this.__escapeDoubleQuotes(opts.TestCaseNameReplace);
                    opts.spiraTestProjectID = this.__escapeDoubleQuotes(opts.spiraTestProjectID);
                    opts.spiraTestProjectName = this.__escapeDoubleQuotes(opts.spiraTestProjectName);
                    opts.spiraTestUsername = this.__escapeDoubleQuotes(opts.spiraTestUsername);
                    opts.TestCaseFolderName = this.__escapeDoubleQuotes(opts.TestCaseFolderName);
                    let cmd = util.format(
                        'sudo python3 ~/%s/RCSpiraTestReporter.py "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s"',
                        libPath.test_mgmt_lib,
                        outputName, host, port, opts.spiraTestProjectID, opts.spiraTestProjectName, opts.spiraTestUsername, opts.spiraTestApiKey, opts.TestCaseFolderName, pattern, replace, suppresslevel, autoCreateTestcase, opts.spiraTestRelease.toString(), spiraTestRelease
                    );
                    cmdLines.push(cmd);
                }
                cmdLines.push("exit $runtest_ret");  // exit with status of testing command

                return cmdLines.join('\n');
                // break;
            }

            case JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_2_PYUNIT:
            case JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_3_PYUNIT: {
                let taskName, pythonCmd;
                if (opts.scriptType == JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_2_PYUNIT) {
                    taskName = 'Selenium WebDriver (Python 2 PyUnit)';
                    pythonCmd = 'python2';
                }
                else {
                    taskName = 'Selenium WebDriver (Python 3 PyUnit)';
                    pythonCmd = 'python3';
                }

                let cmdLines = this.__getCommandHeaders(taskName);

                let startScriptPath = opts.startScriptPath;
                if (!this.__testFilePath(startScriptPath)) {
                    throw new Error('Invalid start script path: ' + startScriptPath);
                }

                // separate the script file from its directory
                let startDirectory, pattern;
                if (startScriptPath.endsWith('.py')) {
                    startDirectory = path.dirname(startScriptPath);
                    pattern = path.basename(startScriptPath);
                }
                else {
                    startDirectory = startScriptPath;
                    pattern = '*.py';
                }

                // output files will be "Selenium-WD-results-<jobName>.html"
                let outputName = 'Selenium-WD-results-' + jobName + '.html';

                let cmd = '';  // command to append (esp. for long formatted commands)

                cmd = util.format(
                    // 'sudo xvfb-run python -m unittest discover %s "%s" > %s',
                    
                    // use the customized taas-xvfb-run.centos rather than the original xvfb-run
                    // installed from the apt/yum repositories to avoid a bug of
                    // mixing standard error and standard output messages (Ubuntu bug #1059947)
                    'sudo -E ~/%s/taas-xvfb-run.centos -s "%s" %s ~/%s/python/runtest.py "%s" "%s" "%s"',
                    libPath.selenium_lib,
                    defaultXServerArgs,
                    pythonCmd,
                    libPath.test_lib,
                    startDirectory, pattern, outputName
                );
                cmdLines.push(cmd);
                cmdLines.push('runtest_ret=$?');

                if(opts.testManagementSpiraTest[0]){
                    let host, port;
                    if(opts.spiraTestHost.indexOf(":") != -1){
                        host = opts.spiraTestHost.split(':')[0];
                        port = opts.spiraTestHost.split(':')[1];
                    }else{
                        host = opts.spiraTestHost;
                        port = 80;
                    }
                    let pattern = this.__escapeDoubleQuotes(opts.TestCaseNamePattern);
                    let replace = this.__escapeDoubleQuotes(opts.TestCaseNameReplace);
                    let autoCreateTestcase = "NotAutoCreateTestCase";
                    opts.SpiraTestOptions.forEach(function(option){
                        if(option == 1){
                            autoCreateTestcase = "AutoCreateTestCase";
                        }
                    });
                    let spiraTestRelease;
                    switch(opts.spiraTestRelease){
                        case 0:
                            spiraTestRelease = '" "';
                            break;
                        case 1:
                            spiraTestRelease = this.__escapeDoubleQuotes(opts.spiraTestReleaseID)+ '" "';
                            break;
                        case 2:
                            spiraTestRelease = this.__escapeDoubleQuotes(opts.spiraTestReleaseVersion)+ '" "';
                            break;
                        case 3:
                            spiraTestRelease = this.__escapeDoubleQuotes(opts.spiraTestReleaseName) + '" "' + this.__escapeDoubleQuotes(opts.spiraTestReleaseVersion);
                            break;
                    }
                    let suppresslevel = opts.FolderSuppressLevel.toString();
                    opts.spiraTestProjectID = this.__escapeDoubleQuotes(opts.spiraTestProjectID);
                    opts.spiraTestProjectName = this.__escapeDoubleQuotes(opts.spiraTestProjectName);
                    opts.spiraTestUsername = this.__escapeDoubleQuotes(opts.spiraTestUsername);
                    opts.TestCaseFolderName = this.__escapeDoubleQuotes(opts.TestCaseFolderName);
                    let cmd = util.format(
                        'sudo python3 ~/%s/PythonSpiraTestReporter.py "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s"',
                        libPath.test_mgmt_lib,
                        outputName, host, port, opts.spiraTestProjectID, opts.spiraTestProjectName, opts.spiraTestUsername, opts.spiraTestApiKey, opts.TestCaseFolderName, pattern, replace, suppresslevel, autoCreateTestcase, opts.spiraTestRelease.toString(), spiraTestRelease
                    );
                    cmdLines.push(cmd);
                }
                if(opts.testManagementTestLink[0]){
                    opts.TestLinkProjectName = this.__escapeDoubleQuotes(opts.TestLinkProjectName);
                    opts.TestLinkTestPlanName = this.__escapeDoubleQuotes(opts.TestLinkTestPlanName);
                    opts.TestLinkBuildName = this.__escapeDoubleQuotes(opts.TestLinkBuildName);
                    opts.TestLinkTestPlatformName = this.__escapeDoubleQuotes(opts.TestLinkTestPlatformName);
                    opts.TestLinkTestSuiteName  = this.__escapeDoubleQuotes(opts.TestLinkTestSuiteName);
                    let cmd = util.format(
                        'sudo python3 ~/%s/PythonTestLinkReporter.py "%s" "%s" "%s" "%s" "%s" "%s" "%s" "%s"',
                        libPath.test_mgmt_lib,
                        outputName, opts.TestLinkUrl+'/lib/api/xmlrpc/v1/xmlrpc.php', opts.TestLinkApiKey, opts.TestLinkProjectName, opts.TestLinkTestPlanName, opts.TestLinkBuildName, opts.TestLinkTestPlatformName, opts.TestLinkTestSuiteName
                    );
                    cmdLines.push(cmd);
                }

                cmdLines.push('exit $runtest_ret');
                return cmdLines.join('\n');
                // break;
            }

            case JenkinsSeleniumJob.SCRIPT_TYPE.WD_JAVA_JUNIT: {
                let cmdLines = this.__getCommandHeaders('Selenium WebDriver (Java)');

                let startScriptPath = opts.startScriptPath;
                if (!this.__testFilePath(startScriptPath)) {
                    throw new Error('Invalid start script path: ' + startScriptPath);
                }

                // output files will be "Selenium-WD-results-Java-JUnit-<jobName>.txt"
                let outputName = 'Selenium-WD-results-Java-JUnit-' + jobName + '.txt';

                cmdLines.push(util.format('JAVA_LIB_DIR=~/%s/java', libPath.selenium_lib));
                cmdLines.push('JAVA_CLASS_PATH=' + [
                    path.dirname(startScriptPath),
                    '$JAVA_LIB_DIR/selenium-server.jar',
                    '$JAVA_LIB_DIR/selenium-java.jar',
                    '$JAVA_LIB_DIR/hamcrest-core.jar'
                ].join(':'));
                let cmd = util.format(
                    'sudo ~/%s/taas-xvfb-run.centos -s "%s" java -cp $JAVA_CLASS_PATH org.junit.runner.JUnitCore %s > %s',
                    libPath.selenium_lib,
                    defaultXServerArgs,
                    path.basename(startScriptPath), outputName
                );
                cmdLines.push(cmd);
                return cmdLines.join('\n');
                // break;
            }

            default:
                throw new Error('Invalid Jenkins Selenium script type: ' + opts.scriptType);
                // break;
        }
    } catch (err) {
        return err;
    }
};


/**
 * Create a new Jenkins Selenium Job.
 * @static
 * @param {Object} opts job settings. See {@link JenkinsSeleniumJob#update} for more info.
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
JenkinsSeleniumJob.create = function(opts, callback) {
    var jobName = JenkinsSeleniumJob.__createJobName();
    JenkinsSeleniumJob.__createJobCfg(opts, jobName, function(err, jobCfgOpts) {
        if (err) {
            let errObj = new Error('Jenkins Selenium job creation error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, job.JenkinsJob.UPDATE.ERROR);
        }
        return job.JenkinsJob._create(jobName, JOBTYPE, jobCfgOpts, callback);
    });
};


/**
 * @private
 */
JenkinsSeleniumJob.__createOptionsDescriptor = [
    {
        name: 'scriptType',
        displayName: 'Script type',
        displayHint: 'script type for a Selenium test suite',
        type: job.JenkinsJob.DESCRIPTOR_TYPE.OPTION,
        options: [
            {
                value: JenkinsSeleniumJob.SCRIPT_TYPE.RC_HTML,
                displayName: 'Selenium RC (HTML)',
                displayHint: 'Selenium RC tests in Seleniumnese'
            },
            {
                value: JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_2_PYUNIT,
                displayName: 'Selenium WebDriver (Python 2 PyUnit)',
                displayHint: 'Selenium WebDriver tests in Python 2'
            },
            {
                value: JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_3_PYUNIT,
                displayName: 'Selenium WebDriver (Python 3 PyUnit)',
                displayHint: 'Selenium WebDriver tests in Python 3'
            },
            {
                value: JenkinsSeleniumJob.SCRIPT_TYPE.WD_JAVA_JUNIT,
                displayName: 'Selenium WebDriver (Java JUnit 4)',
                displayHint: 'Selenium WebDriver tests in Java with JUnit 4'
            }
        ],
        required: true
    },
    {
        name: 'startScriptPath',
        displayName: 'Script path',
        displayHint: 'Path to the selenium test script(s).' +
            ' For RC-HTML tests, it is a path to the test suite file.' +
            ' For WD-PYTHON tests, it is a path either to the test case python file or to the directory of the python test module.' +
            ' For WD-JAVA-JUNIT tests, it is a path to the test suite Java class.',
        type: job.JenkinsJob.DESCRIPTOR_TYPE.PATH,
        required: true
    },
    {
        name: 'targetBaseURL',
        displayName: 'Domain URL',
        displayHint: 'Base URL to the web site under test.' +
            ' It is required only in RC-HTML tests.',
        type: job.JenkinsJob.DESCRIPTOR_TYPE.URL,
    },
    {
        name: 'testManagementSpiraTest',
        displayName: 'Upload test results to SpiraTest',
        displayHint: 'If you check this, system will upload your test report to SpiraTest when you run this task',
        type: job.JenkinsJob.DESCRIPTOR_TYPE.OPTION,
        multiple: true,
        options:[
            {
                value: 1,
                name: 'Upload_report_data_to_SpiraTest',
                displayName: '',
                displayHint: ''
            }
        ]
    },
    {
        name: 'spiraTestForm',
        visibility: false,
        type: job.JenkinsJob.DESCRIPTOR_TYPE.PARENTDIV,
        childs:[
            {
                name: 'spiraTestUsername',
                displayName: 'SpiraTest Username',
                displayHint: 'Username of SpiraTest account. This is needed if uploading to SpiraTest is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'spiraTestApiKey',
                displayName: 'SpiraTest Api-Key',
                displayHint: 'api-key of SpiraTest account. This is needed if uploading to SpiraTest is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'spiraTestHost',
                displayName: 'SpiraTest Host',
                displayHint: 'Url of SpiraTest server. This is needed if uploading to SpiraTest is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'spiraTestProjectID',
                displayName: 'SpiraTest Project ID',
                displayHint: 'Project ID of SpiraTest server. This is needed if project name is not provided.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                groupCheck: 'spiratestProject',
                checkExclusive: 'spiratestProject'
            },
            {
                name: 'spiraTestProjectName',
                displayName: 'SpiraTest Project Name',
                displayHint: 'Project Name of SpiraTest server. This is needed if uploading to SpiraTest is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                groupCheck: 'spiratestProject',
                checkExclusive: 'spiratestProject'
            },
            {
                name: 'spiraTestRelease',
                columnlLength: '10',
                displayName: 'SpiraTest Release',
                displayHint: 'Release information if you want to upload test with release version',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.OPTION,
                options:[
                    {
                        value: 0,
                        displayName: 'None'
                    },
                    {
                        value: 1,
                        displayName: 'apply Release with ID'
                    },
                    {
                        value: 2,
                        displayName: 'apply Release with Version Number'
                    },
                    {
                        value: 3,
                        displayName: 'apply Release with Version Number and Name (it will automatically create a new one if not exist)'
                    }
                ],
                childs: [
                    [
                    ],
                    [
                        {
                            name: 'spiraTestReleaseID',
                            displayName: 'Release ID',
                            displayHint: 'Release ID of release in SpiraTest server.',
                            type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                            required:true
                        }
                    ],
                    [
                        {
                            name: 'spiraTestReleaseVersion',
                            displayName: 'Release Version Number',
                            displayHint: 'Release version number of release in SpiraTest server.',
                            type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                            required:true
                        }
                    ],
                    [
                        {
                            name: 'spiraTestReleaseName',
                            displayName: 'Release Name',
                            displayHint: 'Release name of release in SpiraTest server.',
                            type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                            required:true
                        },
                        {
                            name: 'spiraTestReleaseVersion',
                            displayName: 'Release Version Number',
                            displayHint: 'Release version number of release in SpiraTest server.',
                            type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                            required:true
                        }
                    ]
                ]
            },
            {
                name: 'TestCaseFolderName',
                displayName: 'TestCase Folder Name',
                displayHint: 'TestCase will be created and TestCase in this TestCase Folder. This is needed if uploading to SpiraTest is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestCaseNamePattern',
                displayName: 'TestCase Name Pattern',
                displayHint: 'Regular Expression Pattern of testcase name. Testcase name will be proccessed by this regular expression pattern.If not to process then keep it empty',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:false
            },
            {
                name: 'TestCaseNameReplace',
                displayName: 'TestCase Name Replace',
                displayHint: 'Regular Expression Replace of testcase name. Testcase name will be replaced after using the pattern.If not to process then keep it empty',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:false
            },
            {
                name: 'FolderSuppressLevel',
                displayName: 'TestCase Folder Suppress Level',
                displayHint: 'Suppress level of folder structure of report.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.OPTION,
                options: [
                    {
                        value: 0,
                        displayName: '0',
                        displayHint: 'expand all folders'
                    },
                    {
                        value: 1,
                        displayName: '1',
                        displayHint: 'expand all folders and remove testcase class name folder'
                    },
                    {
                        value: 2,
                        displayName: '2',
                        displayHint: 'expand all folders and remove testcase class name folder and file name folder'
                    }
                ]
            },
            {
                name: 'SpiraTestOptions',
                displayName: 'Options',
                displayHint: 'Additional options',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.OPTION,
                multiple: true,
                options:[
                    {
                        value: 1,
                        name: 'AutoCreate',
                        displayName: 'Auto Create TestCase',
                        displayHint: 'If TaaS cannot find specific testcase or testcase folder, then TaaS will create a new one'
                    }
                ]
            }
        ]
    },
    {
        name: 'testManagementTestLink',
        displayName: 'Upload test results to TestLink',
        displayHint: 'If you check this, system will upload your test report to TestLink when you run this task',
        type: job.JenkinsJob.DESCRIPTOR_TYPE.OPTION,
        multiple: true,
        options:[
            {
                value: 1,
                name: 'Upload_report_data_to_TestLink',
                displayName: '',
                displayHint: ''
            }
        ]
    },
    {
        name: 'TestLinkForm',
        visibility: false,
        type: job.JenkinsJob.DESCRIPTOR_TYPE.PARENTDIV,
        childs:[
            {
                name: 'TestLinkApiKey',
                displayName: 'TestLink Api Key',
                displayHint: 'Api Key of TestLink account. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestLinkUrl',
                displayName: 'TestLink Url',
                displayHint: 'TestLink url. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestLinkProjectName',
                displayName: 'TestLink Project Name',
                displayHint: 'Project Name of TestLink which you want to put record into. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestLinkTestPlanName',
                displayName: 'TestLink TestPlan Name',
                displayHint: 'Build Name of TestLink which you want to put record into. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestLinkBuildName',
                displayName: 'TestLink Build Name',
                displayHint: 'Build Name of TestLink which you want to put record into. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestLinkTestPlatformName',
                displayName: 'TestLink Platform Name',
                displayHint: 'Platform Name of TestLink which you want to put record into. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
            {
                name: 'TestLinkTestSuiteName',
                displayName: 'TestLink TestSuite Name',
                displayHint: 'TestSuite Name of TestLink which you want to put record into. This is needed if uploading to TestLink is required.',
                type: job.JenkinsJob.DESCRIPTOR_TYPE.STRING,
                required:true
            },
        ]
    }
];


/**
 * Get the option descriptor for the static create method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsSeleniumJob.getCreateOptionsDescriptor = function() {
    return JenkinsSeleniumJob.__createOptionsDescriptor;
};


/**
 * Get the option descriptor for the update method
 *
 * @static
 * @returns {array} option descriptor
 */
JenkinsSeleniumJob.getUpdateOptionsDescriptor = function() {
    return JenkinsSeleniumJob.__createOptionsDescriptor;
};


// TODO
/**
 * @private
 */
JenkinsSeleniumJob.__validateCreateOptions = function(opts) {
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
JenkinsSeleniumJob.validateCreateOptions = function(opts) {
    return JenkinsSeleniumJob.__validateCreateOptions(opts);
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
JenkinsSeleniumJob.validateUpdateOptions = function(opts) {
    return JenkinsSeleniumJob.__validateCreateOptions(opts);
};


/**
 * Update Jenkins Selenium job configuration.
 * @param {Object} opts job settings. Attributes:
 *   <ul>
 *     <li>scriptType: a {@link JenkinsSeleniumJob.SCRIPT_TYPE} value</li>
 *     <li>startScriptPath: a string representing the Jenkins test script path in the repository.
 *       For the Python test types, it could be a path to a Python file or to a top directory for all
 *       Python test scripts to run; in the latter case, all directories must be wrapped as Python
 *       packages and all *.py in the sub-directories will be run.
 *     </li>
 *     <li>targetBaseURL: a string representing the base URL of web system under test (optional);
 *       if not given, an URL will be assigned according to deployment settings.</li>
 *   </ul>
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
JenkinsSeleniumJob.prototype.update = function(opts, callback) {
    var self = this;
    JenkinsSeleniumJob.__createJobCfg(opts, self._name, function(err, jobCfgOpts) {
        if (err) {
            let errObj = new Error('Jenkins Selenium job update error: ' + err.toString());
            logger.debug(errObj);
            return callback(errObj, job.JenkinsJob.UPDATE.ERROR);
        }
        return self._update(jobCfgOpts, callback);
    });
};


/**
 * @private
 */
JenkinsSeleniumJob.prototype.__getRunFileInfo = function(filePath) {
    var runFileInfo = {
        type: JenkinsSeleniumJob.SCRIPT_TYPE.NONE
    };
    console.log(filePath);
    console.log(this._wdPythonFilePath);
    if (filePath == this._wdPythonFilePath) {
        // assume Python 2 (Python 2 and Python 3 have the same test report format)
        runFileInfo.type = JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_2_PYUNIT;
        runFileInfo.title = 'WD-PYTHON';
        runFileInfo.viewable = true;
        return runFileInfo;
    }

    if (filePath == this._wdJavaJUnitFilePath) {
        runFileInfo.type = JenkinsSeleniumJob.SCRIPT_TYPE.WD_JAVA_JUNIT;
        runFileInfo.title = 'WD-JAVA-JUNIT';
        runFileInfo.viewable = true;
        return runFileInfo;
    }

    var rcMatchResult = this._rcFilePathMatcher.exec(filePath);
    if (rcMatchResult) {
        var browser = rcMatchResult[1];
        runFileInfo.type = JenkinsSeleniumJob.SCRIPT_TYPE.RC_HTML;
        runFileInfo.title = 'RC-HTML (' + browser + ')';
        runFileInfo.viewable = true;
        return runFileInfo;
    }
    console.log(runFileInfo);
    return runFileInfo;
};


/**
 * Each script type is related to exactly one stats type,
 * so we can determine the stats info based upon the file path only,
 * without the knowledge of the complete stats id.
 * @private
 */
JenkinsSeleniumJob.prototype.__getRunStatsInfo = function(filePath) {
    var self = this;
    var fileInfo = self.__getRunFileInfo(filePath);
    var statsInfo = null;

    switch (fileInfo.type) {
        case JenkinsSeleniumJob.SCRIPT_TYPE.RC_HTML:
            statsInfo = {
                title: fileInfo.title,
                id: {filePath: filePath, scriptType: fileInfo.type},
                fieldNames: ['passes', 'failures'],
                fieldTypes: [
                    job.JenkinsJob.STATS_FIELD_TYPE.NUMBER,
                    job.JenkinsJob.STATS_FIELD_TYPE.NUMBER
                ],
                fieldUnits: ['', ''],
                fieldIndicies: [],
                fieldProportion: [0, 1],
                multiple: false
            }; 
            break;
        case JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_2_PYUNIT:
        case JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_3_PYUNIT:
        case JenkinsSeleniumJob.SCRIPT_TYPE.WD_JAVA_JUNIT:
            statsInfo = {
                title: fileInfo.title,
                id: {filePath: filePath, scriptType: fileInfo.type},
                fieldNames: ['passes', 'failures', 'errors'],
                fieldTypes: [
                    job.JenkinsJob.STATS_FIELD_TYPE.NUMBER,
                    job.JenkinsJob.STATS_FIELD_TYPE.NUMBER,
                    job.JenkinsJob.STATS_FIELD_TYPE.NUMBER
                ],
                fieldUnits: ['', ''],
                fieldIndicies: [],
                fieldProportion: [0, 1, 2],
                multiple: false
            }; 
            break;
    }

    return statsInfo;
};


JenkinsSeleniumJob.prototype.getRunFileList = function(opts, callback) {
    var self = this;
    var jobName = self._name;

    return job.JenkinsJob._getRunFileList(jobName, opts, function(err, fileList) {
        if (err) {
            return callback(new Error('Jenkins Selenium job getRunFileList error: ' + err.toString()));
        }

        var fileDescriptorList = [];

        for (var idx=0; idx<fileList.length; ++idx) {
            var fileDescriptor = fileList[idx];
            var filePath = fileDescriptor.path;
            var fileInfo = self.__getRunFileInfo(filePath);

            // Only keep records of recognized files
            if (fileInfo.type) {
                fileDescriptor.title = fileInfo.title;
                fileDescriptor.viewable = fileInfo.viewable;
                fileDescriptorList.push(fileDescriptor);
            }
        }

        return callback(err, fileDescriptorList);
    });
};


JenkinsSeleniumJob.prototype.getRunStatsList = function(opts, callback) {
    var self = this;
    var jobName = self._name;

    return job.JenkinsJob._getRunFileList(jobName, opts, function(err, fileList) {
        if (err) {
            return callback(new Error('Jenkins Selenium job getRunStatsList error: ' + err.toString()));
        }
        console.log(fileList);
        var runStatsList = [];
        for (var idx=0; idx<fileList.length; ++idx) {
            var fileDescriptor = fileList[idx];
            var filePath = fileDescriptor.path;
            var statsInfo = self.__getRunStatsInfo(filePath);
            if (statsInfo) runStatsList.push(statsInfo);
        }

        return callback(err, runStatsList);
    });
};


/**
 * Analyze WD-PYTHON run files
 * @param {string} contents file contents
 * @param {fn} callback Receives results. Parameters:
 *   <ul>
 *     <li>err (object): error object</li>
 *     <li>results (object): statistics</li>
 *   </ul>
 * @private
 */
JenkinsSeleniumJob.__analyzeWDPython = function(contents, callback) {

    function onError(err) {
        return callback(err);
    }

    if (!contents) return onError(new Error('Empty file'));

    var matcher = new RegExp("<tr id='total_row'>\\s*<td>Total</td>\\s*" +
                             "<td>(\\d+)</td>\\s*" +
                             "<td>(\\d+)</td>\\s*" +
                             "<td>(\\d+)</td>\\s*" +
                             "<td>(\\d+)</td>",
                            'm');
    var matchResults = matcher.exec(contents);

    if (!matchResults) return onError(new Error('Invalid file format'));

    var results = [
        parseInt(matchResults[2]),
        parseInt(matchResults[3]),
        parseInt(matchResults[4])
    ];

    return callback(null, results);
};


/**
 * Analyze RC-HTML run files
 * @param {string} contents file contents
 * @param {fn} callback Receives results. Parameters:
 *   <ul>
 *     <li>err (object): error object</li>
 *     <li>results (object): statistics</li>
 *   </ul>
 * @private
 */
JenkinsSeleniumJob.__analyzeRCHTML = function(contents, callback) {

    function onError(err) {
        return callback(err);
    }

    if (!contents) return onError(new Error('Empty file'));

    var matcher = new RegExp("<tr>\\s*<td>numTestPasses:</td>\\s*<td>(\\d+)</td>\\s*</tr>\\s*" +
                             "<tr>\\s*<td>numTestFailures:</td>\\s*<td>(\\d+)</td>\\s*</tr>",
                            'm');
    var matchResults = matcher.exec(contents);

    if (!matchResults) return onError(new Error('Invalid file format'));

    var results = [
        parseInt(matchResults[1]),
        parseInt(matchResults[2])
    ];

    return callback(null, results);
};


/**
 * Analyze WD-JAVA-JUNIT run files
 * @param {string} contents file contents
 * @param {fn} callback Receives results. Parameters:
 *   <ul>
 *     <li>err (object): error object</li>
 *     <li>results (object): statistics</li>
 *   </ul>
 * @private
 */
JenkinsSeleniumJob.__analyzeWDJavaJUnit = function(contents, callback) {

    function onError(err) {
        return callback(err);
    }

    if (!contents) return onError(new Error('Empty file'));

    var lineStart = contents.indexOf('\n');
    if (lineStart < 0) return onError(new Error('Invalid file format'));
    ++lineStart;
    var lineEnd = contents.indexOf('\n', lineStart);
    if (lineEnd < 0) lineEnd = contents.length;

    var numPass = 0, numFail = 0, numErr = 0;
    for (var idx=lineStart; idx<lineEnd; ++idx) {
        switch (contents.charAt(idx)) {
            case '.': ++numPass; break;
            case 'F': ++numFail; break;
            case 'E': ++numErr; break;
        }
    }

    var results = [
        numPass,
        numFail,
        numErr
    ];

    return callback(null, results);
};

JenkinsSeleniumJob.__escapeDoubleQuotes = function(str){
    return str.replace(/\"/g,"\\\"");
};


JenkinsSeleniumJob.prototype.getRunStats = function(opts, callback) {

    function onError(err) {
        var errName = 'models.jenkins.seleniumJob JenkinsSeleniumJob#getRunStats';
        if (err.name) errName += (' ' + err.name);
        err.name = errName;

        logger.error(err.toString());
        return callback(err);
    }

    var self = this;

    // validate input options
    if (!opts || !opts.statsId || !opts.statsId.filePath || !opts.statsId.scriptType) {
        return onError(new Error('Invalid opts'));
    }

    // get file to analyze
    var filePath = opts.statsId.filePath;
    var runFileOpts = {
        filePath: filePath
    };
    if (opts.runNumber) runFileOpts.runNumber = opts.runNumber;

    return self.getRunFile(runFileOpts, function(err, fileBuf) {
        if (err) return onError(err);

        var fileContents = fileBuf.toString();
        switch (opts.statsId.scriptType) {
            case JenkinsSeleniumJob.SCRIPT_TYPE.RC_HTML:
                return JenkinsSeleniumJob.__analyzeRCHTML(fileContents, function(err, results) {
                    if (err) return onError(err);
                    return callback(err, results, self.__getRunStatsInfo(filePath));
                });
                // break;

            case JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_2_PYUNIT:
            case JenkinsSeleniumJob.SCRIPT_TYPE.WD_PYTHON_3_PYUNIT:
                return JenkinsSeleniumJob.__analyzeWDPython(fileContents, function(err, results) {
                    if (err) return onError(err);
                    return callback(err, results, self.__getRunStatsInfo(filePath));
                });
                // break;

            case JenkinsSeleniumJob.SCRIPT_TYPE.WD_JAVA_JUNIT:
                return JenkinsSeleniumJob.__analyzeWDJavaJUnit(fileContents, function(err, results) {
                    if (err) return onError(err);
                    return callback(err, results, self.__getRunStatsInfo(filePath));
                });
                // break;

            default:
                return onError(new Error('Invalid statsId'));
        }

    });
};


module.exports.JenkinsSeleniumJob = JenkinsSeleniumJob;
module.exports.staticCreate = JenkinsSeleniumJob.create;
module.exports.constructor = JenkinsSeleniumJob;

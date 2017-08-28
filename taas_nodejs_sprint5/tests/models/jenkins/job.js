require('mocha');
var assert = require('assert');
var sinon = require('sinon');
var proxyquire = require('proxyquire');


/* ================== Settings for mocking Jenkins ====================*/
var fakeJenkinsAPI = {
    build: {
        get: null,
        log: null,
        stop: null
    },
    job: {
        build: null,
        config: null,
        create: null,
        get: null,
        list: null
    },
    queue: {
        cancel: null
    }
};


const CLASS_NAME = 'JenkinsJob';
const JOB_NAME = 'Jenkins-test-job';
const JOB_TYPE = 'test/jenkins';
const LOG_MSG = 'Some log msg\n  123   ';
const PARENT_JOB_NAME = 'Jenkins-parent-job';
const PIPELINE_NAME = 'some-pieline';

const QUEUED_JOB_STATUS = {
    displayName: JOB_NAME,
    name: JOB_NAME,
    builds: [
        { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
        { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' }
    ],
    inQueue: true,
    lastBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastCompletedBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastFailedBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastStableBuild: { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' },
    lastSuccessfulBuild: { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' },
    lastUnstableBuild: null,
    lastUnsuccessfulBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    queueItem: {
        id: 1347,
        inQueueSince: 1463549075215,
        task: { name: JOB_NAME, url: 'http://localhost:8090/job/' + JOB_NAME + '/' },
        url: 'queue/item/1347/',
        buildableStartMilliseconds: 1463549075216,
        pending: false
    },
};

const ONGOING_JOB_STATUS = {
    displayName: JOB_NAME,
    name: JOB_NAME,
    builds: [
        { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
        { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' }
    ],
    inQueue: false,
    lastBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastCompletedBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastFailedBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastStableBuild: { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' },
    lastSuccessfulBuild: { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' },
    lastUnstableBuild: null,
    lastUnsuccessfulBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    queueItem: null
};

const EMPTY_JOB_STATUS = {
    displayName: JOB_NAME,
    name: JOB_NAME,
    builds: [],
    inQueue: false,
    lastBuild: null,
    lastCompletedBuild: null,
    lastFailedBuild: null,
    lastStableBuild: null,
    lastSuccessfulBuild: null,
    lastUnstableBuild: null,
    lastUnsuccessfulBuild: null,
    queueItem: null
};

const DONE_FAILED_JOB_STATUS = ONGOING_JOB_STATUS;

const DONE_SUCCESSFUL_JOB_STATUS = {
    displayName: JOB_NAME,
    name: JOB_NAME,
    builds: [
        { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
        { number: 1, url: 'http://localhost:8090/job/' + JOB_NAME + '/1/' }
    ],
    inQueue: false,
    lastBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastCompletedBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastFailedBuild: null,
    lastStableBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastSuccessfulBuild: { number: 2, url: 'http://localhost:8090/job/' + JOB_NAME + '/2/' },
    lastUnstableBuild: null,
    lastUnsuccessfulBuild: null,
    queueItem: null
};

const ONGOING_BUILD_STATUS = {
    building: true,
    duration: 0,
    estimatedDuration: 61709,
    number: 2,
    queueId: 1348,
    timestamp: 1463551681414,
    result: null,
    url: 'http://localhost:8090/job/' + JOB_NAME + '/2/'
};

const SUCCESSFUL_BUILD_STATUS = {
    building: false,
    duration: 58745,
    estimatedDuration: 61709,
    number: 1,
    queueId: 1340,
    timestamp: 1463551681414,
    result: 'SUCCESS',
    url: 'http://localhost:8090/job/' + JOB_NAME + '/1/'
};

const FAILED_BUILD_STATUS = {
    building: false,
    duration: 58745,
    estimatedDuration: 61709,
    number: 1,
    queueId: 1340,
    timestamp: 1463551681414,
    result: 'FAILURE',
    url: 'http://localhost:8090/job/' + JOB_NAME + '/1/'
};


function initQueuedRun() {
    fakeJenkinsAPI.job.get = function(jobName, cb) {
        return cb(null, QUEUED_JOB_STATUS);
    };
}


function initOngoingRun() {
    fakeJenkinsAPI.job.get = function(jobName, cb) {
        return cb(null, ONGOING_JOB_STATUS);
    };
    fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
        if (buildNumber == 2)
            return cb(null, ONGOING_BUILD_STATUS);
        else if (buildNumber == 1)
            return cb(null, SUCCESSFUL_BUILD_STATUS);
        else
            return cb(new Error('run number does not exist!'));
    };
}


function initSuccessfulRun() {
    fakeJenkinsAPI.job.get = function(jobName, cb) {
        return cb(null, DONE_SUCCESSFUL_JOB_STATUS);
    };
    fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
        if (buildNumber == 2) {
            var status = JSON.parse(JSON.stringify(SUCCESSFUL_BUILD_STATUS));
            status.number = 2;
            return cb(null, status);
        }
        else if (buildNumber == 1) {
            var status = JSON.parse(JSON.stringify(SUCCESSFUL_BUILD_STATUS));
            status.number = 1;
            status.timestamp -= 10000;
            return cb(null, status);
        }
        else
            return cb(new Error('run number does not exist!'));
    };
}


function initFailedRun() {
    fakeJenkinsAPI.job.get = function(jobName, cb) {
        return cb(null, DONE_FAILED_JOB_STATUS);
    };
    fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
        if (buildNumber == 2) {
            var status = JSON.parse(JSON.stringify(FAILED_BUILD_STATUS));
            status.number = 2;
            return cb(null, status);
        }
        else if (buildNumber == 1) {
            var status = JSON.parse(JSON.stringify(FAILED_BUILD_STATUS));
            status.number = 1;
            status.timestamp -= 10000;
            return cb(null, status);
        }
        else
            return cb(new Error('run number does not exist!'));
    };
}


function initEmptyRun() {
    fakeJenkinsAPI.job.get = function(jobName, cb) {
        return cb(null, EMPTY_JOB_STATUS);
    };
}


/* ================== Settings for mocking mongoDB JenkinsJobModel ====================*/
function fakeJenkinsJobModel(opts) {
    this._id = '';
    this.type = '';
    this.opts = '{}';
    this.pipeline = null;
    this.parent = null;

    if (opts) {
        for(key in opts) {
            if (opts.hasOwnProperty(key)) this[key] = opts[key];
        }
    }
};
fakeJenkinsJobModel.prototype.save = function(cb) {
    return cb(null);
};
fakeJenkinsJobModel.findById = function(id, cb) {
    return cb(new Error('some error'));
};

var fakeDBM = {
    JENKINSJOB_MODEL: fakeJenkinsJobModel,
    '@noCallThru': true
};


/* ================== Settings for mocking httpPost ====================*/
var fakeHttpPost = {
    postTextData: function(host, port, path, data, callback) {
        return callback(null, '');
    }
};


/* ================== proxyquire the module under test ====================*/
var job = proxyquire('../../../models/jenkins/job', {
    'jenkins': function(url) { return fakeJenkinsAPI; },
    '../../routes/DBM/databaseManagement': fakeDBM,
    '../../lib/httpPost': fakeHttpPost
});
var JenkinsJob = job.JenkinsJob;


suite('models/jenkins/job', function() {

    var stubs = [];

    setup(function() {
        fakeJenkinsAPI.build.get = null;
        fakeJenkinsAPI.build.log = null;
        fakeJenkinsAPI.build.stop = null;
        fakeJenkinsAPI.job.build = null;
        fakeJenkinsAPI.job.config = null;
        fakeJenkinsAPI.job.create = null;
        fakeJenkinsAPI.job.get = null;
        fakeJenkinsAPI.job.list = null;
        fakeJenkinsAPI.queue.cancel = null;
    });

    teardown(function() {
        while (stubs.length) {
            var stub = stubs.pop();
            stub.restore();
        }
    });

    test(CLASS_NAME + '._createJobName: normal case', function() {
        var prefix = 'XYZ'
        var jobName = JenkinsJob._createJobName(prefix);
        var jobNameRE = new RegExp('^' + prefix + '-[\\d]{8}-[a-fA-F\\d]{8}$');
        assert(jobNameRE.test(jobName));
    });

    test(CLASS_NAME + '.getAllJobs: normal case', function(done) {
        var jobNames = ['job1', 'Selenium-Test-12345'];

        fakeJenkinsAPI.job.list = function(cb) {
            var ret = [];
            for (var jn of jobNames) {
                ret.push({color:'blue', name:jn, url:'http://localhost'});
            }
            return cb(null, ret);
        };

        JenkinsJob.getAllJobs(function(err, jobNamesActual) {
            assert(!err);
            jobNames.sort();
            jobNamesActual.sort();
            assert.deepEqual(jobNamesActual, jobNames);
            done();
        });
    });

    test(CLASS_NAME + '.getAllJobs: exceptional case', function(done) {
        fakeJenkinsAPI.job.list = function(cb) {
            return cb(new Error('some error!'));
        };

        JenkinsJob.getAllJobs(function(err, jobNamesActual) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: queued run', function(done) {
        initQueuedRun();

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(!err);
            assert(Array.isArray(runs) && runs.length == 1);
            assert(runs[0].inQueue);
            assert(runs[0].timestamp);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: ongoing run', function(done) {
        initOngoingRun();

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(!err);
            assert(Array.isArray(runs) && runs.length == 1);
            assert(!runs[0].inQueue);
            assert(runs[0].timestamp);
            assert(runs[0].number);
            assert(!runs[0].duration);
            assert(!runs[0].result);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: successful run', function(done) {
        initSuccessfulRun();

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(!err);
            assert(Array.isArray(runs) && runs.length == 1);
            assert(!runs[0].inQueue);
            assert(runs[0].timestamp);
            assert.equal(runs[0].number, 2);
            assert(runs[0].duration);
            assert.equal(runs[0].result, 'SUCCESS');
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: failed run', function(done) {
        initFailedRun();

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(!err);
            assert(Array.isArray(runs) && runs.length == 1);
            assert(!runs[0].inQueue);
            assert(runs[0].timestamp);
            assert.equal(runs[0].number, 2);
            assert(runs[0].duration);
            assert.equal(runs[0].result, 'FAILURE');
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: empty run', function(done) {
        initEmptyRun();

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(!err);
            assert(Array.isArray(runs) && runs.length == 0);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: exceptional case 1', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatus: exceptional case 2', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(null, DONE_FAILED_JOB_STATUS);
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatus(function(err, runs) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatusHistory: normal case', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(null, QUEUED_JOB_STATUS);
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            if (buildNumber == 2)
                return cb(null, ONGOING_BUILD_STATUS);
            else if (buildNumber == 1)
                return cb(null, SUCCESSFUL_BUILD_STATUS);
            else
                return cb(new Error('run number does not exist!'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatusHistory(function(err, runs) {
            assert(!err);
            assert(Array.isArray(runs) && runs.length == 3);
            assert(runs[0].inQueue && runs[0].queueId && runs[0].timestamp);
            assert(!runs[1].inQueue && runs[1].number && runs[1].timestamp && !runs[1].result);
            assert(!runs[2].inQueue && runs[2].number && runs[2].timestamp);
            assert.equal(runs[2].result, 'SUCCESS');
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatusHistory: exceptional case 1', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatusHistory(function(err, runs) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#getRunStatusHistory: exceptional case 2', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(null, DONE_FAILED_JOB_STATUS);
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.getRunStatusHistory(function(err, runs) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#triggerRun: normal case', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(null, DONE_SUCCESSFUL_JOB_STATUS);
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            if (buildNumber == 2) {
                var status = JSON.parse(JSON.stringify(SUCCESSFUL_BUILD_STATUS));
                status.number = 2;
                return cb(null, status);
            }
            else if (buildNumber == 1) {
                var status = JSON.parse(JSON.stringify(SUCCESSFUL_BUILD_STATUS));
                status.number = 1;
                status.timestamp -= 10000;
                return cb(null, status);
            }
            else
                return cb(new Error('run number does not exist!'));
        };
        fakeJenkinsAPI.job.build = function(jobName, cb) {
            return cb(null);
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.triggerRun(opts, function(err, code) {
            assert(!err);
            assert.equal(code, JenkinsJob.TRIGGER.OK);
            done();
        });
    });

    test(CLASS_NAME + '#triggerRun: blocked case', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(null, ONGOING_JOB_STATUS);
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            if (buildNumber == 2)
                return cb(null, ONGOING_BUILD_STATUS);
            else if (buildNumber == 1)
                return cb(null, SUCCESSFUL_BUILD_STATUS);
            else
                return cb(new Error('run number does not exist!'));
        };
        fakeJenkinsAPI.job.build = function(jobName, cb) {
            return cb(null);
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.triggerRun(opts, function(err, code) {
            assert.equal(code, JenkinsJob.TRIGGER.BLOCKED);
            done();
        });
    });

    test(CLASS_NAME + '#triggerRun: exceptional case 1', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(new Error('some error'));
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            return cb(new Error('run number does not exist!'));
        };
        fakeJenkinsAPI.job.build = function(jobName, cb) {
            return cb(null);
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.triggerRun(opts, function(err, code) {
            assert(err);
            assert.equal(code, JenkinsJob.TRIGGER.ERROR);
            done();
        });
    });

    test(CLASS_NAME + '#triggerRun: exceptional case 2', function(done) {
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(null, DONE_SUCCESSFUL_JOB_STATUS);
        };
        fakeJenkinsAPI.build.get = function(jobName, buildNumber, cb) {
            if (buildNumber == 2) {
                var status = JSON.parse(JSON.stringify(SUCCESSFUL_BUILD_STATUS));
                status.number = 2;
                return cb(null, status);
            }
            else if (buildNumber == 1) {
                var status = JSON.parse(JSON.stringify(SUCCESSFUL_BUILD_STATUS));
                status.number = 1;
                status.timestamp -= 10000;
                return cb(null, status);
            }
            else
                return cb(new Error('run number does not exist!'));
        };
        fakeJenkinsAPI.job.build = function(jobName, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.triggerRun(opts, function(err, code) {
            assert(err);
            assert.equal(code, JenkinsJob.TRIGGER.ERROR);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: queued run', function(done) {
        initQueuedRun();
        fakeJenkinsAPI.queue.cancel = function(queueId, cb) {
            return cb(null);
        };

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(!err);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: ongoing run', function(done) {
        initOngoingRun();
        fakeJenkinsAPI.build.stop = function(jobName, runNumber, cb) {
            if (jobName == JOB_NAME && runNumber == 2)
                return cb(null);
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(!err);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: successful run', function(done) {
        initSuccessfulRun();
        fakeJenkinsAPI.build.stop = function(jobName, runNumber, cb) {
            if (jobName == JOB_NAME && runNumber == 2)
                return cb(null);
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(!err);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: empty run', function(done) {
        initEmptyRun();

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(!err);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: exceptional case 1', function(done) {
        initQueuedRun();
        fakeJenkinsAPI.job.get = function(jobName, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: exceptional case 2', function(done) {
        initQueuedRun();
        fakeJenkinsAPI.queue.cancel = function(queueId, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#cancelRun: exceptional case 3', function(done) {
        initOngoingRun();
        fakeJenkinsAPI.build.stop = function(jobName, runNumber, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        job.cancelRun(function(err) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '#getRunLog: run number specified', function(done) {
        initOngoingRun();
        fakeJenkinsAPI.build.log = function(jobName, runNumber, cb) {
            if (jobName == JOB_NAME && runNumber == 1) {
                return cb(null, LOG_MSG);
            }
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {runNumber: 1};
        job.getRunLog(opts, function(err, log) {
            assert(!err);
            assert.equal(log, LOG_MSG);
            done();
        });
    });

    test(CLASS_NAME + '#getRunLog: queued run', function(done) {
        initQueuedRun();

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.getRunLog(opts, function(err, log) {
            assert(!err);
            assert.equal(log, '');
            done();
        });
    });

    test(CLASS_NAME + '#getRunLog: ongoing run', function(done) {
        initOngoingRun();
        fakeJenkinsAPI.build.log = function(jobName, runNumber, cb) {
            if (jobName == JOB_NAME && runNumber == 2) {
                return cb(null, LOG_MSG);
            }
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.getRunLog(opts, function(err, log) {
            assert(!err);
            assert.equal(log, LOG_MSG);
            done();
        });
    });

    test(CLASS_NAME + '#getRunLog: job done (successful run)', function(done) {
        initSuccessfulRun();
        fakeJenkinsAPI.build.log = function(jobName, runNumber, cb) {
            if (jobName == JOB_NAME && runNumber == 2) {
                return cb(null, LOG_MSG);
            }
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.getRunLog(opts, function(err, log) {
            assert(!err);
            assert.equal(log, LOG_MSG);
            done();
        });
    });

    test(CLASS_NAME + '#getRunLog: empty run', function(done) {
        initEmptyRun();
        fakeJenkinsAPI.build.log = function(jobName, runNumber, cb) {
            return cb(new Error('some error'));
        };

        var job = new JenkinsJob(JOB_NAME);
        var opts = {};
        job.getRunLog(opts, function(err, log) {
            assert(err);
            done();
        });
    });

    test(CLASS_NAME + '._create: normal case with username/password', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, null);
        });
        stubs.push(stub);

        fakeJenkinsAPI.job.create = function(jobName, xml, cb) {
            if (jobName == JOB_NAME)
                return cb(null);
            return cb(new Error('some error'));
        };

        var opts = {
            _credentials: [{
                idSuffix: '',
                username: 'someUser',
                password: 'somePassword'
            }]
        };
        JenkinsJob._create(JOB_NAME, JOB_TYPE, opts, function(err, code, jobName) {
            assert(!err);
            assert.equal(code, JenkinsJob.UPDATE.OK);
            assert.equal(jobName, JOB_NAME);
            done();
        });
    });

    test(CLASS_NAME + '._create: exceptional case (findById returning error)', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(new Error('some error'));
        });
        stubs.push(stub);

        var opts = {
            _credentials: [{
                idSuffix: '',
                username: 'someUser',
                password: 'somePassword'
            }]
        };
        JenkinsJob._create(JOB_NAME, JOB_TYPE, opts, function(err, code, jobName) {
            assert(err);
            assert.equal(code, JenkinsJob.UPDATE.ERROR);
            done();
        });
    });

    test(CLASS_NAME + '._create: exceptional case (duplcate job name)', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, new fakeJenkinsJobModel({
                _id: JOB_NAME,
                type: JOB_TYPE,
            }));
        });
        stubs.push(stub);

        var opts = {
            _credentials: [{
                idSuffix: '',
                username: 'someUser',
                password: 'somePassword'
            }]
        };
        JenkinsJob._create(JOB_NAME, JOB_TYPE, opts, function(err, code, jobName) {
            assert(err);
            assert.equal(code, JenkinsJob.UPDATE.ALREADY_EXISTS);
            done();
        });
    });

    test(CLASS_NAME + '._update: normal case with username/privateKey & parent job', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, new fakeJenkinsJobModel({
                _id: JOB_NAME,
                type: JOB_TYPE,
                parent: PARENT_JOB_NAME,
                pipeline: PIPELINE_NAME
            }));
        });
        stubs.push(stub);

        fakeJenkinsAPI.job.config = function(jobName, xml, cb) {
            if (jobName == JOB_NAME)
                return cb(null);
            return cb(new Error('some error'));
        };

        var opts = {
            _credentials: [{
                idSuffix: '',
                username: 'someUser',
                privateKey: 'somePrivateKey'
            }]
        };
        var job = new JenkinsJob(JOB_NAME);
        job._update(opts, function(err, code, jobName) {
            assert(!err);
            assert.equal(code, JenkinsJob.UPDATE.OK);
            assert.equal(jobName, JOB_NAME);
            done();
        });
    });

    // It seems impossible to stub a stand-alone utility function with Sinon
    /*
    test(CLASS_NAME + '._update: exceptional case (postTextData returning error)', function(done) {
        var stub = sinon.stub(fakeHttpPost.postTextData, function(host, port, path, data, callback) {
            return callback(new Error('404 error'));
        });
        var stub = sinon.stub(fakeHttpPost);
        stub.callsArgWith(4, new Error('404 error'));
        stubs.push(stub);

        fakeJenkinsAPI.job.config = function(jobName, xml, cb) {
            if (jobName == JOB_NAME)
                return cb(null);
            return cb(new Error('some error'));
        };

        var opts = {};
        var job = new JenkinsJob(JOB_NAME);
        job._update(opts, function(err, code, jobName) {
            assert(err);
            assert.equal(code, JenkinsJob.UPDATE.ERROR);
            done();
        });
    });
   */

    test(CLASS_NAME + '._update: exceptional case (model.save returning error)', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, new fakeJenkinsJobModel({
                _id: JOB_NAME,
                type: JOB_TYPE,
                parent: PARENT_JOB_NAME,
                pipeline: PIPELINE_NAME
            }));
        });
        stubs.push(stub);

        var stub = sinon.stub(fakeJenkinsJobModel.prototype, 'save', function(cb) {
            return cb(new Error('some error'));
        });
        stubs.push(stub);

        fakeJenkinsAPI.job.config = function(jobName, xml, cb) {
            if (jobName == JOB_NAME)
                return cb(null);
            return cb(new Error('some error'));
        };

        var opts = {};
        var job = new JenkinsJob(JOB_NAME);
        job._update(opts, function(err, code, jobName) {
            assert(err);
            assert.equal(code, JenkinsJob.UPDATE.ERROR);
            done();
        });
    });

    test(CLASS_NAME + '._update: exceptional case (non-existing job)', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, null);
        });
        stubs.push(stub);

        var opts = {};
        var job = new JenkinsJob(JOB_NAME);
        job._update(opts, function(err, code, jobName) {
            assert(err);
            assert.equal(code, JenkinsJob.UPDATE.NOT_EXISTS);
            done();
        });
    });

    test(CLASS_NAME + '.reconfigJob: normal case with username (empty password), scm, tiggers, and publishers', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, new fakeJenkinsJobModel({
                _id: JOB_NAME,
                type: JOB_TYPE,
                parent: PARENT_JOB_NAME,
                pipeline: PIPELINE_NAME,
                opts: JSON.stringify({
                    scm: {},
                    triggers: [],
                    publishers: [],
                    _credentials: [{
                        idSuffix: 'ext1',
                        username: 'someUser'
                    }]
                })
            }));
        });
        stubs.push(stub);

        fakeJenkinsAPI.job.config = function(jobName, xml, cb) {
            if (jobName == JOB_NAME)
                return cb(null);
            return cb(new Error('some error'));
        };

        JenkinsJob.reconfigJob(JOB_NAME, function(err, code, jobName) {
            assert(!err);
            assert.equal(code, JenkinsJob.UPDATE.OK);
            assert.equal(jobName, JOB_NAME);
            done();
        });
    });

    test(CLASS_NAME + '.reconfigJob: exceptional case (non-existing job)', function(done) {
        var stub = sinon.stub(fakeJenkinsJobModel, 'findById', function(id, cb) {
            return cb(null, null);
        });
        stubs.push(stub);

        fakeJenkinsAPI.job.config = function(jobName, xml, cb) {
            if (jobName == JOB_NAME)
                return cb(null);
            return cb(new Error('some error'));
        };

        JenkinsJob.reconfigJob(JOB_NAME, function(err, code, jobName) {
            assert(err);
            assert.equal(code, JenkinsJob.UPDATE.NOT_EXISTS);
            done();
        });
    });
});

//require('../../test_lib/mongo_schemas.js');
var async = require('async');
var sinon = require('sinon');
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru();
var descriptors = require('../../test_lib/descriptors.js');
var job_lib = require('../../test_lib/job.js');
var fakesession = {};
var fakeconfig = require('../../test_lib/config');
var fakeProject = {};
var fakeTesttask = {};
var fakeMongoose = require('mongoose');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(fakeMongoose);
var fakerender = {};
var fakejob = { JenkinsJob: { DESCRIPTOR_TYPE: job_lib.DESCRIPTOR_TYPE } };

var fakeJenkinsFactory = { JenkinsFactory: { getJobClass: sinon.stub() }};
var git_jobclass = { getCreateOptionsDescriptor: sinon.stub() };
git_jobclass.getCreateOptionsDescriptor.returns(descriptors.GIT_DESCRIPTOR);
var build_jobclass = { getCreateOptionsDescriptor: sinon.stub() };
build_jobclass.getCreateOptionsDescriptor.returns(descriptors.BUILD_DESCRIPTOR);
var deploy_jobclass = { getCreateOptionsDescriptor: sinon.stub() };
deploy_jobclass.getCreateOptionsDescriptor.returns(descriptors.DEPLOY_DESCRIPTOR);
fakeJenkinsFactory.JenkinsFactory.getJobClass.withArgs('scm/git').returns(git_jobclass);
fakeJenkinsFactory.JenkinsFactory.getJobClass.withArgs('build/generic').returns(build_jobclass);
fakeJenkinsFactory.JenkinsFactory.getJobClass.withArgs('deploy/generic').returns(deploy_jobclass);

var faketimeLib = {};
var fakelogging = sinon.stub();
fakelogging.log_routes = sinon.stub();
fakelogging.log_routes.returns(fakelogging);
fakelogging.setLevel = sinon.stub();
var faketaskcopy = {};
var faketaskorder = { funcWakeTask: sinon.stub() };
faketaskorder.funcWakeTask.callsArg(1);
var Project, TestTask;
var project = proxyquire('../../../routes/Project/project.js',
	{
		"mongoose": fakeMongoose,
		"../../config": fakeconfig,
		"../../lib/session.js": fakesession,
		"../../lib/render.js": fakerender,
		"../../models/jenkins/job.js": fakejob,
		"../../models/jenkins/factory": fakeJenkinsFactory,
		"../../lib/time": faketimeLib,
		"../../lib/logging": fakelogging,
		"../TestTask/taskCopy.js": faketaskcopy,
		"../TestTask/taskOrder.js": faketaskorder
	}
);
suite('routes/Project/project.js', function(){
	suiteSetup(function(done){
		this.timeout(300000);
		// fake mongoose connection to a prepared memory storage
		mockgoose.prepareStorage().then(function(){
			fakeMongoose.connect('mongodb://testcase.com/Testing', function(err){
				Project = fakeMongoose.model('project');
				TestTask = fakeMongoose.model('testtasks');
				done();
			});
		});
	});
	// clean up the database before every test case starts.
	setup(function(done){
		async.parallel([
			function(callback){
				Project.remove({}, function(err){
					callback();
				});
			},function(callback){
				TestTask.remove({}, function(err){
					callback();
				});
			}
		],function(){
			done();
		});
	});
	test('projectCreate: normal case', function(done){
		// async parallel is used for parallel creating multiple projects, but this case has only one project.
		async.parallel([
			function(callback){
				// insert data into mongo database before testing starts.
				Project.create({
					email: 'test@itri.org.tw',
					proj_name: 'fakeproject',
				}, function(err, project){
					if(err){
						callback(err);
					}else{
						TestTask.create([
							{
								proj_id: project._id,
								email: 'test@itri.org.tw',
								jobtype: 'test/test',
								testtaskname: 'test1'
							},
							{
								proj_id: project._id,
								email: 'test@itri.org.tw',
								jobtype: 'test',
								testtaskname: 'test2'
							}
						], function(err, testtasks){
							callback(err);
						});
					}
				});
			}
		], function(err){
			if(err){
				assert(false, err.message);
			}
			fakelogging.debug = sinon.stub();
			fakesession.checkLoginbySess = sinon.stub();
			fakesession.getSessofEmail = sinon.stub();
			fakesession.getSessofEmail.returns('test@itri.org.tw');
			// if render.render is called, it means the function ends. Therefore, starts assertion.
			fakerender.render = function(req, res, view, title, json){
				assert.equal(view, 'projectcreate');
				assert.equal(json.tstask.length, 1);
				assert.equal(json.tstask[0].testtaskname, 'test1');
				done();
			}
			project.projectCreate({}, {});
		});
	});
	test('buildnewproject: normal case', function(done){
		// fakebody represents the json data sent from front-end while user submits the form.
		var fakebody = {
			projDesc: '',
			projname: 'fakeproject2',
			Buildproj: 'Buildproj',
			Deployproj: 'Deployproj',
			CopyTask: 'CopyTask',
			projSvm: 'scm/git',
			projUrl: 'http://test.git',
			projBranch: '*/master',
			projUsername: '',
			projPassword: '',
			projSsh: '',
			BuildPlugin: 'testbuild.sh',
			DeployCfg: 'testdeploy.json',
			Scmval: 'repoURL=http%3A%2F%2Ftest.git&repoBranch=*%2Fmaster&username=&password=&privateKey=',
			Buildval: 'buildScript=testbuild.sh',
			Deployval: 'deployCfg=testdeploy.json',
			taskid: [ ]
		}
		async.parallel([
			function(callback){
				Project.create({
					email: 'test@itri.org.tw',
					proj_name: 'fakeproject'
				}, function(err, project){
					if(err){
						callback(err);
					}else{
						TestTask.create([
							{
								proj_id: project._id,
								email: 'test@itri.org.tw',
								jobtype: 'test/test',
								testtaskname: 'test1'
							},
							{
								proj_id: project._id,
								email: 'test@itri.org.tw',
								jobtype: 'test',
								testtaskname: 'test2'
							}
						], function(err, testtasks){
								testtasks.forEach(function(testtask){
									fakebody.taskid.push(testtask._id);
								});
								callback(err);
						});
					}
				});
			}
		], function(err){
			fakelogging.debug = sinon.stub();
			fakesession.checkLoginbySess = sinon.stub();
			fakesession.getSessofEmail = sinon.stub();
			fakesession.getSessofEmail.returns('test@itri.org.tw');
			fakesession.checkLoginbySessBool = sinon.stub();
			fakesession.checkLoginbySessBool.returns(true);
			faketaskcopy.serverCopyTask = sinon.stub();
			var fakejobcount = 0;
			fakeJenkinsFactory.JenkinsFactory.createJob = function(jobSvnType, jobSvnOpts, callback){
				// start assertion when createJob is called.
				fakejobcount++;
				if(fakejobcount == 1){
					assert.equal(jobSvnType, 'scm/git');
				}else if(fakejobcount == 2){
					assert.equal(jobSvnType, 'build/generic');
				}else if(fakejobcount == 3){
					assert.equal(jobSvnType, 'deploy/generic');
				}
				// call the callback function with parameter which represents the success of the creation of jenkins job.
				callback(null, job_lib.OK, 'fakejob'+fakejobcount.toString());
			}
			var fakereq = {body: fakebody};
			var fakeres = {end: function(){
				async.parallel([
					function(callback){
						// check project and testtasks are created
						Project.find({ proj_name: 'fakeproject2', email: 'test@itri.org.tw' }).exec(function(err, projects){
							assert.equal(projects.length, 1);
							async.parallel([
								function(callback){
									TestTask.find({email: 'test@itri.org.tw', jobname: 'fakejob1'
									, proj_id: projects[0]._id, jobtype: 'scm/git'}).exec(function(err, testtasks){
										assert.equal(testtasks.length, 1);
										callback(err);
									});
								},
								function(callback){
									TestTask.find({email: 'test@itri.org.tw', jobname: 'fakejob2'
									, proj_id: projects[0]._id, jobtype: 'build/generic'}).exec(function(err, testtasks){
										assert.equal(testtasks.length, 1);
										callback(err);
									});
								},
								function(callback){
									TestTask.find({email: 'test@itri.org.tw', jobname: 'fakejob3'
									, proj_id: projects[0]._id, jobtype: 'deploy/generic'}).exec(function(err, testtasks){
										assert.equal(testtasks.length, 1);
										callback(err);
									});
								},
								function(callback){
									// check serverCopyTask is called with correct parameters.
									assert.equal(faketaskcopy.serverCopyTask.getCall(0).args[0].toString(), fakebody.taskid[0].toString());
									assert.equal(faketaskcopy.serverCopyTask.getCall(0).args[1].toString(), projects[0]._id.toString());
									assert.equal(faketaskcopy.serverCopyTask.getCall(1).args[0].toString(), fakebody.taskid[1].toString());
									assert.equal(faketaskcopy.serverCopyTask.getCall(1).args[1].toString(), projects[0]._id.toString());
									callback();
								}
							],function(err, b){
								callback(err);
							});
						});
					},
					function(callback){
						assert.equal(fakejobcount, 3);
						callback();
					}
				], function(err){
					if(err){
						assert(false, err.message);
					}
					done();
				})
			}};
			project.buildnewproject(fakereq, fakeres);
		});
	});
});

/**
*
* APP
* @fileoverview This file has functions related to add apps.
* Rivision:
* 2016/01/27(Kristen)
*  add session
*
*
*/
const SECRET_SIGN_KEY = '1j4ul4y94e93ejo ek6x87'; //for signed cookie
// mongoose setup
var EXPRESS = require('express');
APP = EXPRESS();  // databaseManagement requires existence of APP
var DBM = require('./routes/DBM/databaseManagement');

var SESSION = require('express-session');
var HTTP = require('http');
var PATH = require('path');
var ENGINE = require('ejs-locals');
var LDAP = require('ldapjs');
var BODYPARSER = require('body-parser'),
	MONGOOSE = require('mongoose'),
	ObjectID = require('mongodb').ObjectID;
var CRYPTO = require('crypto');
APP.use(BODYPARSER.json());
APP.use(BODYPARSER.urlencoded());

// all environments
APP.set('port', process.env.PORT || 81);
APP.engine('ejs', ENGINE);
APP.set('views', PATH.join(__dirname, 'views'));
APP.set('view engine', 'ejs');
APP.use(EXPRESS.favicon());
APP.use(EXPRESS.logger('dev'));
APP.use(EXPRESS.cookieParser(SECRET_SIGN_KEY));	//signed key
APP.use(EXPRESS.bodyParser());
APP.use(EXPRESS.json());
APP.use(EXPRESS.urlencoded());
APP.use(EXPRESS.methodOverride());
APP.use(SESSION({secret: 'keyboard cat',resave: false,saveUninitialized: true}));
APP.use(APP.router);
APP.use(EXPRESS.static(PATH.join(__dirname, 'public')));

// Routes
var ROUTES = require('./routes');
APP.get('/', ROUTES.index);
APP.get('/logout', ROUTES.logout);
APP.post('/ldaplogin', ROUTES.ldaplogin);
APP.post('/verifysignup', ROUTES.verifysignup);
APP.post('/verifylogin', ROUTES.verifylogin);	//login by kristen
APP.get('/verifylgByMail/:id', ROUTES.verifylgByMail);	//20160126 report by kristen

// Dashboard
var dashboard = require('./routes/Dashboard/dashboard.js');
APP.post('/addReport',dashboard.addReport); //add layout list task by Daniel, move to dashboard by kristen 2016/03/22
APP.post('/prepareReportData/:mode',dashboard.prepareReportData);// get task result data for drawing chart
APP.get('/dashboard', dashboard.dashboard);
APP.post('/addTab',dashboard.addTab); // add tab name by Daniel
APP.post('/removeDashLayoutbyTab/:dom/:tab',dashboard.removeDashLayoutbyTab); // delete tab name by Daniel
APP.post('/savetoDashLayout',dashboard.savetoDashLayout); 
APP.post('/saveCsstoDashLayout',dashboard.saveCsstoDashLayout); 
APP.get('/showDashLaybyTab/:tab',dashboard.showDashLaybyTab); 
APP.post('/saveNoShowtoDBbyDOM',dashboard.saveNoShowtoDBbyDOM); 
APP.get('/findDashLayoutbyDOMid/:dom',dashboard.findDashLayoutbyDOMid); 
APP.post('/updateAskAutoReflesh/:tab',dashboard.updateAskAutoReflesh); 
APP.get('/getAskAutoReflesh/:tab',dashboard.getAskAutoReflesh); 
APP.post('/getRunStatus',dashboard.getRunStatus); 
APP.post('/removeDashLayoutbyDOM/:dom',dashboard.removeDashLayoutbyDOM); 
APP.get('/isDomExisted/:dom',dashboard.isDomExisted); 
APP.get('/spiratest', dashboard.spiratest);
APP.get('/jira', dashboard.jira);
APP.post('/getRunningOrnot',dashboard.getRunningOrnot);

// Project
var project = require('./routes/Project/project.js');
APP.get('/projectList', project.projectList);
APP.get('/projectCreate', project.projectCreate);
APP.get('/projectEdit/:id', project.projectEdit);
APP.post('/fProjEdit/:id', project.fProjEdit);
APP.post('/fProjDestroy/:id', project.fProjDestroy);
APP.get('/fprojSelect/:id', project.fprojSelect);
APP.post('/getProjectStatus/:id',project.getProjectStatus);
APP.post('/copyProject',project.copyProject);
APP.post("/buildnewproject",project.buildnewproject);

//// Project status light
let projectStatusLight = require('./routes/Project/statusLight.js');
APP.post('/statusLightOfProject', projectStatusLight.statusLightOfProject);

// Task List
var taskList = require('./routes/TestTask/taskList.js');
APP.get('/tasklistByProjID/:id', taskList.tasklistByProjID);
APP.get('/createTestTask',taskList.createTestTask);
APP.get('/editTestTask/:id', taskList.editTestTask);
APP.get('/runTask/:id', taskList.runTask);
APP.get('/stopTask/:id', taskList.stopTask);
APP.post('/removeTask/:id', taskList.removeTestTask);
APP.get('/TestTaskDetail/:id',taskList.addTestTaskDetail);

// Pipeline Project Page
let pipelineProject = require('./routes/Project/pipelineProject');
APP.get('/project/:pid', pipelineProject.projectStatusPage);
APP.get('/project/:pid/runs/api', pipelineProject.projectRunsAPI);
APP.get('/project/:pid/trigger/api', pipelineProject.projectTriggerAPI);
APP.get('/project/:pid/run/:rid', pipelineProject.projectRunLogPage);
APP.get('/project/:pid/run/:rid/api', pipelineProject.projectSingleRunAPI);
APP.get('/project/:pid/run/:rid/log/start/:start/api', pipelineProject.projectRunLogAPI);

//// Task status light
var taskStatus = require('./routes/TestTask/statusLight.js');
APP.post('/statusLightOfTasks', taskStatus.statusLightOfTasks);

//// Task order
var taskOrder = require('./routes/TestTask/taskOrder.js');
APP.post('/getTasksOrder', taskOrder.getTasksOrder);
APP.post('/wakeTask', taskOrder.wakeTask);
APP.post('/sleepTask', taskOrder.sleepTask);
APP.post('/upOrderTask', taskOrder.upOrderTask);
APP.post('/downOrderTask', taskOrder.downOrderTask);
APP.post('/contDownstreamTask', taskOrder.enableContDownstream);
APP.post('/wakeAllTasks', taskOrder.wakeAllTasks);

//// Task pipeline
var taskPipeline = require('./routes/TestTask/taskPipeline.js');
APP.post('/pipeline', taskPipeline.pipeline);

// Task
var task = require('./routes/TestTask/task.js');
APP.post('/getTaskTypes', task.getTaskTypes);
APP.post('/loadAddTaskForm', task.loadAddTaskForm);
APP.post('/addTesttask',task.addTesttask);

// Task Update (Edit)
var taskUpdate = require('./routes/TestTask/taskUpdate.js');
APP.post('/updateTestTask', taskUpdate.updateTestTask);
APP.post('/loadEditTaskForm', taskUpdate.loadEditTaskForm);
APP.post('/getTaskInfo', taskUpdate.getTaskInfo);

// Test task
var testTask = require('./routes/TestTask/testTask.js');
APP.post('/checkTaskNameExist', testTask.checkTaskNameExist);
APP.post('/saveTesttaskInfo',testTask.saveTesttaskInfo);
APP.post('/getJobLog',testTask.getJobLog);
APP.post('/getJenkinsJobLogByTabName',testTask.getJenkinsJobLogByTabName);
APP.post('/getJenkinsJobLogById',testTask.getJenkinsJobLogById);
APP.post('/statusOfTasks',testTask.statusOfTasks);
APP.post('/getInfomationOfBuildHistory', testTask.getInfomationOfBuildHistory);
APP.post('/getLastBuildInfo',testTask.getLastBuildInfo);

//Task deploy stack api
var resourceManagement = require('./routes/TestTask/resourceManagement.js');
APP.post('/getStackInfo', resourceManagement.getStackInfo);
APP.post('/deleteInstance', resourceManagement.deleteInstance);
APP.post('/rebuildInstance', resourceManagement.rebuildInstance);
APP.post('/rebootInstance', resourceManagement.rebootInstance);

DBM.connectDB();

HTTP.createServer(APP).listen(APP.get('port'), function() {
    console.log('Express server listening on port ' + APP.get('port'));
});

var conf = require('../../lib/config');
var TaaSOperation = require('../../lib/operation').TaaSOperation;
const MONGODB_URL = conf.get('main_db');
const PROJECT_COLLECTION_NAME = 'project';
var MONGOOSE = require('mongoose');

// connect database and create login table

// Ref: Reconnecting to MongoDB when Mongoose connect fails at startup
// http://bites.goodeggs.com/posts/reconnecting-to-mongodb-when-mongoose-connect-fails-at-startup/
// We add auto_reconnect, retry count here
var connectRetryCnt = 0;
const CONNECT_RETRY_CNT_LIMIT = 20;
const CONNECT_RETRY_INTERVAL = 5000;
var connectDB = function() {
    var connOpts = {
        server: {
            socketOptions: {autoReconnect:true},
            auto_reconnect: true,
            reconnectTries: CONNECT_RETRY_CNT_LIMIT,
            reconnectInterval: CONNECT_RETRY_INTERVAL
        }};
    MONGOOSE.connect(MONGODB_URL, connOpts);
};
// connectDBWithRetry();
exports.connectDB = connectDB;
var DB = MONGOOSE.connection;

DB.once('open', console.log.bind(console, 'connected to database'));
DB.on('connecting', console.error.bind(console, 'database connecting'));
DB.on('disconnecting', console.error.bind(console, 'database disconnecting'));
DB.on('disconnected', console.error.bind(console, 'database disconnected'));
DB.on('close', console.error.bind(console, 'database close'));
DB.on('reconnected', console.error.bind(console, 'database reconnected'));
DB.on('error', function(err) {
    console.error('database connection error');
    console.error(err, err.stack.split('\n'));
    TaaSOperation.switchMode(TaaSOperation.OPMODE.MAINTENANCE);
    // mongoDB auto-reconnection only takes effect when the driver has
    // already created a connection to mongo server, so we need to
    // implement manual reconnect here on initial connection error
    if (++connectRetryCnt < CONNECT_RETRY_CNT_LIMIT) {
        console.error('schedule database reconnection')
        setTimeout(connectDB, CONNECT_RETRY_INTERVAL);
    }
    else {
        console.error('database reconnection counts exceeded');
    }
});
DB.on('connected', function() {
    console.error('database connected');
    TaaSOperation.switchMode(TaaSOperation.OPMODE.NORMAL);
});

var SCHEMA = MONGOOSE.Schema;

// =========================================
// Login schema 
// =========================================
var LOGINSCHEMA = new SCHEMA({
	name: {
		type: String,
		unique: true
	}, //2016/2/25(Kristen)
	password: String,
	email: {
		type: String,
		unique: true
	}, //email unique
	createtime: String,
	verifyEmail: {
		type: Boolean,
		default: false
    } //2016/1/28(Kristen)
});

exports.LOGIN_MODEL = MONGOOSE.model('userinfo', LOGINSCHEMA);


// =========================================
// Project schema
// =========================================
var PROJECTSCHEMA = new SCHEMA({
	email: {
		type: String,
		required: true
	},
	proj_name: {
		type: String,
		required: true
	},
	proj_description: {
		type: String
	},
	pipelinename: {
		type: String,
		default: ''
	},
	createtime: {
		type: Date,
		default: Date.now
	},
	updatetime: {
		type: Date,
		default: Date.now
	},
	proj_share: {
		type: Array,
		default: []

    },
	permission: {
	    type: Array,
	    default: []
	}

}, {
	collection: PROJECT_COLLECTION_NAME
});

exports.PROJECT_MODEL = MONGOOSE.model('project', PROJECTSCHEMA);


// =========================================
// TestTask schema
// =========================================
var TESTTASK_Schema = new SCHEMA({
	email: {
		type: String,
		required: true
	},
	proj_id: String,
	proj_name: String,
	testtaskname: String,
	jobtype: {
		type: String,
		required: true	
	},
	jobname: {
		type: String,
		default: ''
	},
	testscript: Object,  // job options
	status: {
		type: Number,
		default: 0
	},
	level: {
		type: Number,
		default: 0 // sleep task
	},
	contdownstream: {
		type: Boolean,
		default: false
	},
	isnotifyed: Boolean,
	createtime: {
		type: Date,
		default: Date.now
	},
	updatetime: {
		type: Date,
		default: Date.now
	}
});

exports.TESTTASK_MODEL = MONGOOSE.model('testtasks', TESTTASK_Schema);




// =========================================
// Jenkins Job Schema
// =========================================
var JENKINSJOB_Schema = new SCHEMA({
	_id: {
		type: String,
		required: true,
		unique: true
	},
	type: {
		type: String,
		required: true
	},
	opts: {
		type: String,
		default: '{}',
		required: true
	},
	pipeline: {
		type: String,
		default: null
	},
	parent: {
		type: String,
		default: null
	},
	continueOnParentFailure: {
		type: Boolean,
		default: false
	}
});

exports.JENKINSJOB_MODEL = MONGOOSE.model('JenkinsJobModel', JENKINSJOB_Schema);


// =========================================
// Jenkins Pipeline Schema
// =========================================
var JENKINSPIPELINE_Schema = new SCHEMA({
	_id: {
		type: String,
		required: true,
		unique: true
	},
	flow: {
		type: String,
		default: '[]',
		required: true
	},
	continueDownstreamOnFailure: {
		type: String,
		default: '[]'
	}
});

exports.JENKINSPIPELINE_MODEL = MONGOOSE.model('JenkinsPipelineModel', JENKINSPIPELINE_Schema);

// =========================================
// Dashboard Memo Layout
// primary  key : dom 
// reference key : tab, email (DASHBOARD_TAB_Schema)
// =========================================
var DASHBOARD_LAYOUT_Schema = new SCHEMA({
	
	tab: String, //tab name of chart
	task: String, //task name of chart
	chartType: String, //chart type : pie/line/message
	moveTime: String, //record time when moving dom in new place
	email: {        //record user who create this chart
		type: String,
		required: true
	},
	dom: { //dom id of chart
		type: String,
		unique: true
	},
	css:{ //record css when moving dom in new place
		type: Object,
		default: []
	},
	parmList:{  //function parameter
		type: Array,
		default: []
	},
	job:{    //job report parameter: [jobName, type ,number]
		type: Array,
		default: []
	},
	noShow:{ //true : when user close this dom, false : default
		type: Boolean,
		default: false,
	}
	/*autoReflesh: { //true: auto reflesh, false: as usual
		type: Boolean,
		default: false,
	}*/
});
exports.DASHBOARD_LAYOUT_MODEL = MONGOOSE.model('DashboardLayout', DASHBOARD_LAYOUT_Schema);

// =========================================
// Dashboard Tab 
// pramary key : email, tab
// =========================================
var DASHBOARD_TAB_Schema = new SCHEMA({
	email: {   //record user who create this chart
		type: String,
		required: true
	},
	tab: String, //tab name 
	createtime: Date, //record time when create tab
	autoRefleshAsk: { //popup Auto Reflesh Message Window, true: ask again, false: don't ask
		type: Boolean,
		default: true,
	},
	autoReflesh: { //auto reflesh all chart on this tab, true: auto reflesh, false: as usual
		type: Boolean,
		default: false,
	}
});
DASHBOARD_TAB_Schema.index({ email: 1, tab: 1 }, { unique: true });
exports.DASHBOARD_TAB_MODEL = MONGOOSE.model('DashboardTab', DASHBOARD_TAB_Schema);// origin name = statistics

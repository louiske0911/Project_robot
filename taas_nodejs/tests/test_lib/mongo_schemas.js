var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProjectSchema = new Schema({
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
	}
});
var TestTaskSchema = new Schema({
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
	testscript: Object,
	status: {
		type: Number,
		default: 0
	},
	level: {
		type: Number,
		default: 0 // sleep task
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
//mongoose.model('project', ProjectSchema);
//mongoose.model('testtasks', TestTaskSchema);
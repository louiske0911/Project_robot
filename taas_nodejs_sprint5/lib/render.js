/**
 * This is a module for render.
 *
 * Author : Urostigma
 *
 * Cratedate : 2016/1/28
 */
var mongoose = require('mongoose');
var Project = mongoose.model('project');
var Testtask = mongoose.model('testtasks');
var _ = require('underscore');
var session = require('./session.js');
var cookie = require('./cookie.js');

var render = function(req, res, view, title, json) {
	var user_id = session.getSessofEmail(req);

	//find projects that the user has
	Project.
	find({
		email: user_id
	}).
	exec(function(err, projs) {
		if (err) return callback(err);

		if (session.getSessofProjectID(req)) {
			//find the project that is selected
			Project.findById(session.getSessofProjectID(req), function(err2, proj) {
				if (err2) return callback(err2);
				var basic = {
					title: title,
					userName: cookie.getCookieofUserName(req),
					projs: projs,
					selectProj: proj.proj_name
				};
				res.render(view, _.extend(basic, json));
			});
		} else {
			//no selected project
			var basic = {
				title: title,
				userName: cookie.getCookieofUserName(req),
				projs: projs,
				selectProj: null
			};
			res.render(view, _.extend(basic, json));
		}
	});
};

//setting module for require
module.exports = {
	render: render
};

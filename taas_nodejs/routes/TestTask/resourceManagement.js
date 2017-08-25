var session = require('../../lib/session.js');
var httprequest = require('../../lib/httprequest.js');
var config = require('../../lib/config.js');
var timeLib = require('../../lib/time');
var url = require('url');

/*
 *  proxy the request from backend to rsc_mgmt node which cam get stack info
 *  @param {Object} req
 *  @param {Object} res
 */
exports.getStackInfo = function(req, res){
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var projID = req.body.projID;
	var api = url.resolve(config.get('resource_management_server'), '/taas/getDeployTaskStackInfo/' + projID );
	httprequest('GET', null, null, api, function(err, data){
		if(err){
			res.end(err.message);
		}else{
			var stacksinfo = JSON.parse(data.body);
			stacksinfo.forEach(function(stack){
				if(stack.hasOwnProperty("instances")){
					stack.instances.forEach(function(instance){
						instance.create_time = timeLib.formatTime(instance.create_time);
					});
				}
			});
            res.json(stacksinfo);
            res.end();
		}
	});
}

exports.deleteInstance = function(req, res){
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var instanceid = req.body.instanceid;
	var api = url.resolve(config.get('resource_management_server'), '/nova/deleteInstanceByID/' + instanceid );
	httprequest('DELETE', null, null, api, function(err, data){
		if(err){
			res.end(err.message);
		}else{
			res.end('success');
		}
	});
}

exports.rebuildInstance = function(req, res){
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}

	var instanceid = req.body.instanceid;
	var api = url.resolve(config.get('resource_management_server'), '/nova/rebuildInstance/' + instanceid );
	httprequest('POST', null, null, api, function(err, data){
		if(err){
			res.end(err.message);
		}else{
			res.end('success');
		}
	});
}

exports.rebootInstance = function(req, res){
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}
	
	var instanceid = req.body.instanceid;
	var api = url.resolve(config.get('resource_management_server'), '/nova/rebootInstance/' + instanceid );
	httprequest('POST', null, null, api, function(err, data){
		if(err){
			res.end(err.message);
		}else{
			res.end('success');
		}
	});
}

exports.hardRebootInstance = function(req, res){
	if (!session.checkLoginbySessBool(req)) {
		res.end('verify error');
		return;
	}
	
	var instanceid = req.body.instanceid;
	var api = url.resolve(config.get('resource_management_server'), '/nova/hardRebootInstance/' + instanceid );
	httprequest('POST', null, null, api, function(err, data){
		if(err){
			res.end(err.message);
		}else{
			res.end('success');
		}
	});
}
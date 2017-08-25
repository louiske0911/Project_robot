/**
 * A API module for nova.
 *
 * @fileoverview This is a api module for Openstack - nova.
 *
 * @author itri453696@itri.org.tw (Woody)
 *
 * 2016/8/15 (Woody)
 *  1. add getInstances()
 *  2. add getInstanceByID()
 *  3. add rebootInstance()
 *  4. add rebuildInstance()
 *  5. add findInstanceIdByName()
 *  6. add rebuildInstanceByName()
 *  7. add getInstancesSimply()
 *  8. add deleteInstanceByID()
 */
var express = require('express');
var ex = {};
ex.router = express.Router();
var config = require('../lib/config.js');
var url = require('url');
var httprequest = require('../lib/httprequest.js');
var _ = require('underscore');

ex.router.route('/getInstances').get(function(req, res) {
    getInstances(function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.set('Content-Type', 'application/json');
            res.end(data);
        }
    });
});

/**
 * REST : get instances
 * @return {Function} callback
 */
function getInstances(callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var headers = {
                "X-Auth-Token" : token,
                'Content-Type' : 'application/json'
            };
            var api = config.get('nova') + config.get('tenant_id') +'/servers/detail';
            httprequest('GET', null, headers, api, function(err, data){
                if(err){
                    callback(err);
                }else{
                    callback(null, data.body);
                }
            });
        }
    });
}

ex.router.route('/getInstanceByID/:id').get(function(req, res) {
    server_id = req.params.id;
    getInstanceByID(server_id, function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.set('Content-Type', 'application/json');
            res.end(data);
        }
    });
});

ex.router.route('/getInstanceByName/:name').get(function(req, res) {
    server_name = req.params.name;
    findInstanceIdByName(server_name, function(err, instance_id){
        if(err){
            res.end(err.message);
        }else{
            getInstanceByID(instance_id, function(err, data){
                if(err){
                    res.end(err.message);
                }else{
                    data = JSON.parse(data);
                    res.end(JSON.stringify(data.server));
                }
            });
        }
    });
});


ex.router.route('/getInstanceStatusByName/:name').get(function(req, res) {
    server_name = req.params.name;
    findInstanceIdByName(server_name, function(err, instance_id){
        if(err){
            res.end(err.message);
        }else{
            getInstanceByID(instance_id, function(err, data){
                if(err){
                    res.end(err.message);
                }else{
                    data = JSON.parse(data);
                    if(data.server['OS-EXT-STS:task_state'] == "deleting"){
                        res.end("DELETING");
                    }else{
                        res.end(data.server.status);
                    }
                }
            });
        }
    });
});

/**
 * REST : get instance by ID
 * @param  {String} instance_id
 * instance id
 * @return {Function} callback
 */
function getInstanceByID(instance_id, callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var headers = {
                "X-Auth-Token" : token
            };
            var api = config.get('nova') + config.get('tenant_id') +'/servers/'+ instance_id;
            httprequest('GET', null, headers, api, function(err, data){
                if(err){
                    callback(err);
                }else{
                    callback(null, data.body);
                }
            });
        }
    });
}

ex.router.route('/rebootInstance/:id').post(function(req, res) {
    server_id = req.params.id;
    rebootInstance(server_id, function(err, data){
        if(err){
            res.end(err.message);
        }else if(data == "success"){
            res.end('success');
        }else{
            res.end('some errors happen');
        }
    });
});

function rebootInstance(instance_id, callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var body = {
                "reboot" : {
                    "type": "SOFT"
                }
            };
            var headers = {
                "X-Auth-Token" : token,
                'Content-Type': 'application/json'
            };
            var api = config.get('nova') + config.get('tenant_id') +'/servers/'+ instance_id +'/action';
            httprequest('POST', body, headers, api, function(err, data){
                if(err){
                    callback(err);
                }else{
                    callback(null, 'success');
                }
            });
        }
    });
}

ex.router.route('/hardRebootInstance/:id').post(function(req, res) {
    server_id = req.params.id;
    hardRebootInstance(server_id, function(err, data){
        if(err){
            res.end(err.message);
        }else if(data == "success"){
            res.end('success');
        }else{
            res.end('some errors happen');
        }
    });
});

/**
 * REST : reboot instance
 * @param  {String} instance_id
 * instance id
 * @return {Function} callback
 */
function hardRebootInstance(instance_id, callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var body = {
                "reboot" : {
                    "type" : "HARD"
                }
            };
            var headers = {
                "X-Auth-Token" : token,
                'Content-Type': 'application/json'
            };
            var api = config.get('nova') + config.get('tenant_id') +'/servers/'+ instance_id +'/action';
            httprequest('POST', body, headers, api, function(err, data){
                if(err){
                    callback(err);
                }else{
                    callback(null, 'success');
                }
            });
        }
    });
}

ex.router.route('/rebuildInstance/:id').post(function(req, res) {
    server_id = req.params.id;
    rebuildInstance(server_id, function(err, data){
        if(err){
            res.end(err.message);
        }else if(data == "success"){
            res.end('success');
        }else{
            res.end('some errors happen');
        }
    });
});

/**
 * REST : rebuild instance
 * @param  {String} instance_id
 * instance id
 * @return {Function} callback
 */
function rebuildInstance(instance_id, callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            getInstanceByID(instance_id, function(err, data){
                if(err){
                    callback(err);
                }else{
                    data = JSON.parse(data);
                    var body = {
                        "rebuild" : {
                            "imageRef" : data.server.image.id
                        }
                    };
                    var headers = {
                        "X-Auth-Token" : token,
                        'Content-Type': 'application/json'
                    };
                    var api = config.get('nova') + config.get('tenant_id') +'/servers/'+ instance_id +'/action';
                    httprequest('POST', body, headers, api, function(err, data){
                        if(err){
                            callback(err);
                        }else{
                            callback(null, 'success');
                        }
                    });
                }
            });
        }
    });
};

ex.router.route('/rebuildInstanceByName/:name').post(function(req, res) {
    server_name = req.params.name;
    rebuildInstanceByName(server_name, function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.end('success');
        }
    });
});

/**
 * REST : rebuild instance by name
 * @param  {String} instance_name
 * instance name
 * @return {Function} callback
 */
function rebuildInstanceByName(instance_name, callback){
    findInstanceIdByName(instance_name, function(err, instance_id){
        if(err){
            callback(err);
        }else{
            rebuildInstance(instance_id, function(err, data){
                if(err){
                    callback(err);
                }else if(data == "success"){
                    callback(null, data);
                }else{
                    callback(new Error('some errors happen'));
                }
            });
        }
    });
}

/**
 * REST : find instance Id by name
 * @param  {String} instance_name
 * instance name
 * @return {Function} callback
 */
function findInstanceIdByName(instance_name, callback){
    getInstancesSimply(function(err, data){
        if(err){
            callback(err);
        }else{
            data = JSON.parse(data);
            var instance = _.find(data.servers, function(server){
                return server.name == instance_name;
            });
            if(instance == null){
                callback(new Error('can not find instance'));
            }else{
                callback(null, instance.id);
            }
        }
    });
}

/**
 * REST : get instances simply
 * @return {Function} callback
 */
function getInstancesSimply(callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var headers = {
                "X-Auth-Token" : token
            };
            var api = config.get('nova') + config.get('tenant_id') +'/servers';
            httprequest('GET', null, headers, api, function(err, data){
                if(err){
                    callback(err);
                }else{
                    callback(null, data.body);
                }
            });
        }
    });
}

ex.router.route('/deleteInstanceByID/:id').delete(function(req, res) {
    server_id = req.params.id;
    deleteInstanceByID(server_id, function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.end('success');
        }
    });
});

/**
 * REST : delete instance by ID
 * @param  {String} instance_id
 * instance id
 * @return {Function} callback
 */
function deleteInstanceByID(instance_id, callback){
    auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var headers = {
                "X-Auth-Token" : token
            };
            var api = config.get('nova') + config.get('tenant_id') +'/servers/'+ instance_id;
            httprequest('DELETE', null, headers, api, function(err, data){
                if(err){
                    callback(err);
                }else{
                    callback(null, data.body);
                }
            });
        }
    });
}
ex.getInstances = getInstances;
ex.getInstanceByID = getInstanceByID;
ex.rebootInstance = rebootInstance;
ex.hardRebootInstance = hardRebootInstance;
ex.rebuildInstanceByName = rebuildInstanceByName;
ex.findInstanceIdByName = findInstanceIdByName;
ex.rebuildInstance = rebuildInstance;
ex.getInstancesSimply = getInstancesSimply;
ex.deleteInstanceByID = deleteInstanceByID;
module.exports = ex;
/**
 * A API module for heat.
 *
 * @fileoverview This is a api module for Openstack - heat.
 *
 * @author itri453740@itri.org.tw (DaJen)
 *
 * 2016/8/15 (DaJen)
 *  1. add createStack()
 *  2. add updateStack()
 *  3. add checkStack()
 *  4. add getStack()
 *  5. add deleteStack()
 *  6. add getStackOutputKey()
 *  7. add getStackStatus()
 */
var _ = require('underscore');
var conf = require('../lib/config');
var express = require('express');
var fs = require('fs');
var httprequest = require('../lib/httprequest');

var heat_template = fs.readFileSync(__dirname + '/../heat_template.yaml', 'utf8');
var server_conf = fs.readFileSync(__dirname + '/../server_conf.yaml', 'utf8');

var ex = {};
ex.router = express.Router();

ex.router.route('/createStack/:name/:num_instances/:vm_spec_name')
    .get(function(req, res) {
    var vm_spec_name = req.params.vm_spec_name;
    var stack_name = req.params.name;
    var num_instances = req.params.num_instances;
    createStack(stack_name, vm_spec_name, num_instances, function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.send(data);
        }
    })
});

/**
 * REST : create Stack
 * @param  {String} stack_name
 * stack name
 * @param  {String} vm_spec_name
 * user defined instance name used for TaaS frontend
 * @param  {int} num_instances
 * preferred instance amount
 * @return {Function} callback
 */
function createStack(stack_name, vm_spec_name, num_instances, callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks';
            body = {
                "files": {
                    "server_conf.yaml" : server_conf
                },
                "disable_rollback": true,
                "parameters": {
                    "vm_spec_name": vm_spec_name,
                    "key_name": conf.get('key_name'),
                    "image": conf.get('image'),
                    "private_net": conf.get('network_private'),
                    "public_net": conf.get('network_public'),
                    "num_instances": num_instances
                },
                "stack_name": stack_name,
                "template": heat_template
            }
            headers = {
                "X-Auth-Token" : token,
                "X-Auth-User"  : conf.get('username'),
                "X-Auth-Key"   : conf.get('password'),
                'Content-Type' : 'application/json'
            }
            httprequest('POST', body, headers, url, function(err, data){
                if(err){
                    callback(err);
                }else{
                    //stack_info = JSON.parse(data.body);
                    callback(null,"create success");
                }
            });
        }
    });
}

ex.router.route('/updateStack/:name/:num_instances')
    .get(function(req, res) {
    stack_name = req.params.name;
    var num_instances = req.params.num_instances;
    updateStack(stack_name, num_instances,function(erro, data){
        if(erro){
            res.end("update " + erro.message);
        }else{
            res.send(data);
        }
    })
});

/**
 * REST : update Stack
 * @param  {String} stack_name
 * stack name
 * @param  {int} num_instances
 * preferred instance amount
 * @return {Function} callback
 */
function updateStack(stack_name, num_instances, callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/' + stack_name;
            body = {
                "existing": true,
                "files": {
                    "server_conf.yaml" : server_conf
                },
                "parameters": {
                    "key_name": conf.get('key_name'),
                    "image": conf.get('image'),
                    "private_net": conf.get('network_private'),
                    "public_net": conf.get('network_public'),
                    "num_instances": num_instances
                },
                "template": heat_template
            }
            headers = {
                "X-Auth-Token" : token,
                "X-Auth-User"  : conf.get('username'),
                "X-Auth-Key"   : conf.get('password'),
                'Content-Type' : 'application/json'
            }
            httprequest('PUT', body, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    httprequest('PUT', body, headers, resp.headers.location, function(erro, stack){
                        if(erro){
                            callback(erro);
                        }else{
                            callback(null,"update success");
                        }
                    });
                }
            });
        }
    });
}

/**
 * REST : check Stack
 * @param  {String} stack_name
 * stack name
 * @return {Function} callback
 */
function checkStack(stack_name,callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/' + stack_name + '/actions';
            body = {
                "check": null
            }
            headers = {
                "X-Auth-Token" : token,
                'Content-Type' : 'application/json'
            }
            httprequest('POST', body, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    httprequest('POST', body, headers, resp.headers.location, function(erro, stack){
                        if(erro){
                            callback(erro);
                        }else{
                            callback(null,"check success");
                        }
                    });
                }
            });
        }
    });
}

ex.router.route('/getStack/:stack_name')
    .get(function(req, res) {
    stack_name = req.params.stack_name;
    getStack(stack_name,function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.set('Content-Type', 'application/json');
            res.end(data);
        }
    })
})

/**
 * REST : Read Stack
 * @param  {String} stack_name
 * stack name
 * @return {Function} callback
 */
function getStack(stack_name,callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            headers = {
                'X-Auth-Token':token
            }
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/'+ stack_name;
            httprequest('GET', null, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    httprequest('GET', null, headers, resp.headers.location, function(erro, stack){
                        if(erro){
                            callback(erro);
                        }else{
                            callback(null , stack.body);
                        }
                    });
                }
            });
        }
    });
}
/**
 * REST : Get StackWith ID
 * @param  {String} stack_name
 * stack name
 * @param  {String} stack_id
 * stack id
 * @return {Function} callback
 */
function getStackWithID(stack_name, stack_id, callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            headers = {
                'X-Auth-Token':token
            }
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/'+ stack_name + '/' + stack_id;
            httprequest('GET', null, headers, url, function(erro, stack){
                if(erro){
                    callback(erro);
                }else{
                    callback(null , JSON.parse(stack.body));
                }
            });
        }
    });
}

ex.router.route('/deleteStack/:name')
    .get(function(req, res) {
    stack_name = req.params.name;
    deleteStack(stack_name,function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.send(data);
        }
    })
    
})

/**
 * REST : Delete Stack
 * @param  {String} stack_name
 * stack name
 * @return {Function} callback
 */
function deleteStack(stack_name,callback){
    auth.getToken(function(error,token){
        if (error) {
            callback(error);
        }else{
            headers = {
                'X-Auth-Token':token
            }
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/'+ stack_name;
            httprequest('GET', null, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    httprequest('DELETE', null, headers, resp.headers.location, function(erro, stack){
                        if(erro){
                            callback(erro);
                        }else{
                            callback(null , "success");
                        }
                    });
                }
            });
        }
    });
}

ex.router.route('/getStack/:name/output/:outputKey')
    .get(function(req, res) {
    stack_name = req.params.name;
    output_key = req.params.outputKey;
    getStackOutputKey(stack_name,output_key,function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.send(data);
        }
    })
})

/**
 * REST : Read Stack value by the output key 
 * @param  {String} stack_name
 * stack name
 * @param  {String} output_key
 * the output key
 * @return {Function} callback
 */
function getStackOutputKey(stack_name,output_key,callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            headers = {
                'X-Auth-Token':token
            }
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/'+ stack_name;
            httprequest('GET', null, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    httprequest('GET', null, headers, resp.headers.location, function(erro, stack){
                        if(erro){
                            callback(erro);
                        }else{
                            body = JSON.parse(stack.body);

                            var output = _.find(body.stack.outputs, function(ouput){
                                return ouput.output_key === output_key;
                            });

                            if(typeof output === 'undefined') callback(new Error('cannot find this output'));
                            else callback(null,output.output_value);
                        }
                    });
                }
            });
        }
    });
}

ex.router.route('/getStack/:name/status')
    .get(function(req, res) {
    stack_name = req.params.name;
    getStackStatus(stack_name,function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.send(data);
        }
    })
});

/**
 * REST : Read Stack status
 * @param  {String} stack_name
 * stack name
 * @return {Function} callback
 */
function getStackStatus(stack_name,callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            headers = {
                'X-Auth-Token':token
            }
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/'+ stack_name;
            httprequest('GET', null, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    httprequest('GET', null, headers, resp.headers.location, function(err, stack){
                        if(err){
                            callback(err);
                        }else{
                            body = JSON.parse(stack.body);
                            callback(null,body.stack.stack_status);
                        }
                    });
                }
            });
        }
    });
}
ex.router.route('/getStacksList')
    .get(function(req, res) {
    getStacksList(function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.json(data);
            res.end();
        }
    });
});
/**
 * REST : Get Stack List
 * @return {Function} callback
 */
function getStacksList(callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            headers = {
                'X-Auth-Token':token
            }
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks';
            httprequest('GET', null, headers, url, function(err, resp){
                if(err){
                    callback(err);
                }else{
                    callback(null, JSON.parse(resp.body));
                }
            });
        }
    });
}
ex.router.route('/getStackEventList/:stack_name/:stack_id').get(function(req, res) {
    var stack_name = req.params.stack_name;
    var stack_id = req.params.stack_id;
    getStackEventList(stack_name, stack_id, function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.set('Content-Type', 'application/json');
            res.end(data);
        }
    });
});
function getStackEventList(stack_name, stack_id, callback){
    auth.getToken(function(error,token){
        if(error){
            callback(error);
        }else{
            url = conf.get('heat') + conf.get('tenant_id') + '/stacks/' + stack_name + '/' + stack_id +'/events';
            headers = {
                "X-Auth-Token" : token
            }
            httprequest('GET', null, headers, url, function(erro, data){
                if(erro){
                    callback(erro);
                }else{
                    callback(null, data.body);
                }
            });
        }
    });
}
ex.createStack = createStack;
ex.getStack = getStack;
ex.getStackWithID = getStackWithID;
ex.deleteStack = deleteStack;
ex.getStackStatus = getStackStatus;
ex.getStackOutputKey = getStackOutputKey;
ex.updateStack = updateStack;
ex.getStacksList = getStacksList;
ex.getStackEventList = getStackEventList;
module.exports = ex;

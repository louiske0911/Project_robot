/**
 * A Controller for Express.
 *
 * @fileoverview route of Express.
 *
 * @author itri453696@itri.org.tw (Woody)
 *
 * 2016/8/15 (Woody)
 *  1. add route('/getDeployTaskStackInfo/:jobname')
 */
var express = require('express');
var ex = {};
ex.router = express.Router();
var heat = require('./orchestration');
var nova = require('./nova');
var glance = require('./glance');
var _ = require('underscore');
var async = require('async');

/*
 *  collect stacks' information for specific project and arrange them into 
 *  the form which fits the feature of display information.
 */
ex.router.route('/getDeployTaskStackInfo/:projID').get(function(req, res){
	var projID = req.params.projID;
	var return_value = [];
	heat.getStacksList(function(err, stacks){
		if(err){
			res.end(JSON.stringify(return_value));
		}else{
            var project_stacks = _.filter(stacks.stacks, function(stack){
                var name_split = stack.stack_name.split("_");
                if(name_split.length >= 3 && name_split[1] == projID){
                    return true;
                }
                return false;
            });
            //collect every stack information in parallel
            async.each(project_stacks, function(stack, callback){
                heat.getStackWithID(stack.stack_name, stack.id,function(err, stack_detail){
                    if(!(stack_detail.stack.stack_status == "CREATE_COMPLETE" || stack_detail.stack.stack_status == "UPDATE_COMPLETE")){
                        /*
                         *  if stack is not in status of create_complete or update_complete, there will not be 
                         *  instance information in the output region. Therefore, we need to collect
                         *  the status of stack instead of the information of instances.
                         */
                        var second_underscore_position = stack_detail.stack.stack_name.indexOf('_', stack_detail.stack.stack_name.indexOf('_') + 1);
                        var return_stack = {
                            vm_spec_name: stack_detail.stack.stack_name.substr(second_underscore_position + 1),
                            stack_status: stack_detail.stack.stack_status,
                        }
                        if(return_stack.stack_status == "CREATE_FAILED" || return_stack.stack_status == "UPDATE_FAILED" ||return_stack.stack_status == "DELETE_FAILED"){
                            heat.getStackEventList(stack.stack_name, stack.id, function(err, data){
                                if(err){
                                    callback(err);
                                }else{
                                    data = JSON.parse(data);
                                    data = _.filter(data.events, function(event){
                                        if(event.resource_status.search("FAILED") != -1){
                                            return true;
                                        }else{
                                            return false;
                                        }
                                    });
                                    reduced_data = [];
                                    data.forEach(function(event){
                                        var reduced_event = {
                                            resource_status_reason: event.resource_status_reason
                                        };
                                        reduced_data.push(reduced_event);
                                    });
                                    return_stack.failed_events = reduced_data;
                                    return_value.push(return_stack);
                                    callback();
                                }
                            });
                        }else{
                            return_value.push(return_stack);
                            callback();
                        }
                    }else{
                        // transform raw stack outputs (list) into object
                        let stack_outputs = {};
                        for (let i in stack_detail.stack.outputs) {
                            stack_outputs[stack_detail.stack.outputs[i].output_key] = stack_detail.stack.outputs[i].output_value;
                        }
                        // collect stack information
                        let return_stack = {
                            vm_spec_name: stack_outputs.vm_spec_name,
                            stack_status: stack_detail.stack.stack_status,
                            public_ips: stack_outputs.floating_ip,
                            private_ips: stack_outputs.private_ip,
                            instance_name: stack_outputs.server_name,
                            flavor:stack_detail.stack.parameters.flavor,
                            keypair:stack_detail.stack.parameters.key_name,
                            instances:[]
                        }
                        // collect every instance information in parallel
                        async.forEachOf(return_stack.instance_name, function(instance_name, key, callback){
                            async.waterfall(
                                [
                                    function(callback){
                                        //find instance id of this instance
                                        nova.findInstanceIdByName(instance_name, function(err, instance_id){
                                            if(err){
                                                callback(err);
                                            }else{
                                                callback(null, instance_id);
                                            }
                                        });
                                    },
                                    function(instance_id, callback){
                                        // find detail information of this instance
                                        nova.getInstanceByID(instance_id, function(err, instance){
                                            if(err){
                                                callback(err);
                                            }else{
                                                callback(null, JSON.parse(instance));
                                            }
                                        });
                                    },
                                    function(instance, callback){
                                        // find image information of this instance
                                        glance.getImageByID(instance.server.image.id, function(err, image){
                                            if(err){
                                                callback(err);
                                            }else{
                                                var image = JSON.parse(image);
                                                var status = instance.server.status;
                                                if(instance.server['OS-EXT-STS:task_state'] == "deleting"){
                                                    status = "DELETING";
                                                }
                                                callback(null, {
                                                    id: instance.server.id,
                                                    name: instance.server.name,
                                                    status: status,
                                                    image: image.name,
                                                    create_time: instance.server.created
                                                });
                                            }
                                        });
                                    }
                                ],
                                function(err, return_instance){
                                    if(err){
                                        /*
                                         *  if there is any error while finding instance information,
                                         *  it will return back error message.
                                         */
                                        callback(err);
                                    }else{
                                        /*
                                         *  if there has no error while finding instance information,
                                         *  it will push back instance information to stack information.
                                         */
                                        return_stack.instances[key] = return_instance;
                                        callback();
                                    }
                                }
                            );
                        },function(err){
                            if(err){
                                /*
                                 *  if there is any error while finding stack information,
                                 *  it will return back error message.
                                 */
                                callback(err);
                            }else{
                                /*
                                 *  if there has no error while finding stack information,
                                 *  it will push back stack information to return_value
                                 *  as http body.
                                 */
                                return_value.push(return_stack);
                                callback();
                            }
                        });
                    }
                });
            }, function(err){
                if(err){
                    res.end(err.message);
                }else{
                    res.json(return_value);
                    res.end();
                }
            });
		}
	});
});

module.exports = ex;

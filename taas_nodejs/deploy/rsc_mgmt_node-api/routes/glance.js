/**
 * A API module for glance.
 *
 * @fileoverview This is a api module for Openstack - glance.
 *
 * @author itri453696@itri.org.tw (Woody)
 *
 * 2016/8/15 (Woody)
 *  1. add getImageByID()
 */
var express = require('express');
var ex = {};
ex.router = express.Router();
var config = require('../lib/config.js');
var httprequest = require('../lib/httprequest.js');

ex.router.route('/getImageByID/:id').get(function(req, res) {
	var image_id = req.params.id;
    getImageByID(image_id, function(err, data){
        if(err){
            res.end(err.message);
        }else{
            res.set('Content-Type', 'application/json');
            res.end(data);
        }
    });
});

/**
 * REST : get image by ID
 * @param  {String} image_id
 * image id
 * @return {Function} callback
 */
function getImageByID(image_id,callback){
	auth.getToken(function(err, token){
        if(err){
            callback(err);
        }else{
            var headers = {
                "X-Auth-Token" : token,
                'Content-Type' : 'application/json'
            };
            var api = config.get('glance') + 'images/' + image_id;
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
ex.getImageByID = getImageByID;
module.exports = ex;
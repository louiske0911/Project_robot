/**
 * An auth for OpenStack API call.
 *
 * @fileoverview OpenStack Identity API v3.
 *
 * @author itri453696@itri.org.tw (Woody)
 *
 * 2016/8/15 (Woody)
 *  1. add export function
 */
var http = require('http');
var url = require('url');
var log4js = require('log4js');
log4js.configure('./logfile.json');
var logger = log4js.getLogger('openstack');

/**
 * HttpRequest : use http of all situation
 * @param  {String} method
 * POST,PUT...
 * @param  {Array} data
 * set in http body
 * @param  {Array} headers
 * set in http header
 * @param  {String} api_url
 * api url path
 * @return {Function} callback
 */
module.exports = function(method, data, headers, api_url, callback){
	var targetUrl = url.parse(api_url, true);
	var options = {
	    hostname: targetUrl.hostname,
	    port: targetUrl.port,
	    path: targetUrl.pathname,
	    method: method,
	    headers:headers
	};

	var returnobj = {
		body:""
	};
	var req = http.request(options,function(res){
		res.on('data',function(chunk){
			returnobj.body += chunk.toString();
		});
		res.on('end',function(){
			if(res.statusCode >= 200 && res.statusCode < 400){
				logger.info(method + ' ' + api_url + ' ' + res.statusCode + ' ' + res.statusMessage);
				returnobj.headers = res.headers;
				callback(null,returnobj);
			}else{
				logger.error(method + ' ' + api_url + ' ' + res.statusCode + ' ' + res.statusMessage);
				callback(new Error(res.statusCode + ' ' + res.statusMessage));
			}
		});
	});

	req.on('socket', function (socket) {
	    socket.setTimeout(20000);
	    socket.on('timeout', function(e) {
	    	logger.error(api_url + ' Connection timeout');
	    	req.abort();
    	});
	});

	req.on('error', function(e){
		
	});
	
	if(data)
		req.end(JSON.stringify(data));
	else
		req.end();
}
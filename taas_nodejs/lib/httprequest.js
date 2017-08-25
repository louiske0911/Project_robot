var http = require('http');
var url = require('url');

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
				returnobj.headers = res.headers;
				callback(null,returnobj);
			}else{
				callback(new Error(res.statusCode + ' ' + res.statusMessage));
			}
		});
	});

	req.on('socket', function (socket) {
	    socket.setTimeout(20000);
	    socket.on('timeout', function(e) {
	    	req.abort();
        	callback(new Error('Connection timeout'));
    	});
	});

	req.on('error', function(e){
		
	});
	
	if(data)
		req.end(JSON.stringify(data));
	else
		req.end();
};

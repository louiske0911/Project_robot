/**
 * An auth for OpenStack API call.
 *
 * @fileoverview OpenStack Identity API v3.
 *
 * @author itri453740@itri.org.tw (Woody,DaJen)
 *
 * 2016/8/15 (Woody)
 *  1. add auth
 * 2016/8/15 (DaJen)
 *  1. fixed timeout problem
 */
var conf = require('./config.js');
var httprequest = require('./httprequest.js');

var log4js = require('log4js');
log4js.configure('./logfile.json');
var logger = log4js.getLogger('openstack');
var method = Auth.prototype;
var getTokenCount = 0;

/**Auth class
*/
function Auth(time) {
	this.expireTime  = 	(typeof time !=='undefined')
						?time*1000 
						: 0;
    this._createTime = null;
    this._token = null;
}

/**
 * Auth : get token
 * @return {Function} callback
 */
method.getToken = function(callback){
	var now = Date.now();
	var isTokenExpried = (this._token != null && (this.expireTime-Date.now() <= 60000)) || this._token == null ;
	if(isTokenExpried){
		var body = {
			"auth": {
		        "identity": {
		            "methods": [
		                "password"
		            ],
		            "password": {
		                "user": {
		                    "name": conf.get('username'),
		                    "domain": {
		                        "id": "default"
		                    },
		                    "password": conf.get('password')
		                }
		            }
		        },
		        "scope": {
		            "project": {
		                "id": conf.get('tenant_id')
		            }
		        }
		    }
		};
		var headers = {
		  	'Content-Type':'application/json'
		};
		var url = conf.get('keystone') + 'auth/tokens';
		httprequest('POST', body, headers, url, function(err, data){
			if(err){
				callback(err);
			}else{
				logger.info('create new token: ' + data.headers['x-subject-token']);
				try{
					body = JSON.parse(data.body);
					auth._createTime = Date.parse(body['token']['issued_at']);
					auth._token = data.headers['x-subject-token'];
					auth.expireTime = Date.parse(body['token']['expires_at']);
					callback(null, data.headers['x-subject-token']);
				} catch (e) {
					if(++getTokenCount < 20){
						method.getToken(callback);
					}else{
						callback(new Error('creating token failed'));
					}
				}
			}
		});
	}
	else {
		callback(null,this._token);
	}
};

module.exports = Auth;
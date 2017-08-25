/**
 * @fileoverview test /lib/cookie.js
 * @author itri453740@itri.org.tw (DaJen)
 */ 
/* 
 * 2016/7/14 (DaJen)
 *   1. add test module.setCookiebyUserName()
 *   2. add test module.getCookieofUserName()
 *   3. add test module.destoryCookieofUserName()
 */

/**
 * use the same session key to set session while testing
 * @const 
 */
const SECRET_SIGN_KEY = '1j4ul4y94e93ejo ek6x87';

var sinon = require('sinon');
var cookie = require('../../lib/cookie');
var signature = require('cookie-signature');
var urlencode = require('urlencode');

var request = require('request');
var http = require('http');
var assert = require('chai').assert;
var express = require('express');
var path = require('path');
var SESSION = require('express-session');
var app = express();
var server;

/**
 * for test lib/cookie.js
 */
suite('lib/cookie.js',function(){
	/**
	 * set the params to bulid a server to test cookie.js
	 */
	setup(function(){
		app.set('port',process.env.TEST_PORT || 2001);
		app.set('views', path.join(__dirname, '../views'));
		app.use(SESSION({secret: 'keyboard cat',resave: false,saveUninitialized: true}));
		app.set('view engine', 'ejs');
		app.use(express.cookieParser(SECRET_SIGN_KEY));
	});

	teardown(function() {
        server.close();
    });

	/**
	 * build server and create a http request to test module.setCookiebyUserName
	 */
	test('setCookiebyUserName: it should set cookie by userName',function(done){
		app.get('/cookie',function(req,res){
			var fakeName = "John";
			cookie.setCookiebyUserName(res,fakeName);
			res.end('success');
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request("http://localhost:"+app.get('port')+"/cookie", function(error, response, body) {
				var encryptName = "userName="+urlencode('s:'+signature.sign('John', SECRET_SIGN_KEY), 'utf8');
				console.log(encryptName);
				assert.isNotOk(error,error);
				assert.equal(response.headers['set-cookie'][0],encryptName+'; Path=/','set cookie fail');
				done();
			});
		});
	});
	
	/**
	 * build server and create a http request to test module.getCookieofUserName
	 */
	test('get cookie of userName: it should get cookie of userName',function(done){
		var userName;
		app.post('/getCookie',function(req,res){
			userName = cookie.getCookieofUserName(req);
			res.end('success');
		});

		server = http.createServer(app).listen(app.get('port'),function(){
			var jar = request.jar();
			var encryptName = "userName="+urlencode('s:'+signature.sign('John', SECRET_SIGN_KEY), 'utf8');
			var cookie = request.cookie(encryptName);
			jar.setCookie(cookie,"http://localhost:"+app.get('port'));
			request({
				url: "http://localhost:"+app.get('port')+"/getCookie",
				method: "POST",
				jar: jar
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(userName,'John','it get wrong userName');
				done();
			});
		});
	});

	/**
	 * build server and create a http request to test module.destoryCookieofUserName
	 */
	test('clear cookie of userName: it should clear cookie of userName',function(done){
		app.post('/clearCookie',function(req,res){
			cookie.destoryCookieofUserName(res);
			res.end('success');
		});

		server = http.createServer(app).listen(app.get('port'),function(){
			var jar = request.jar();
			var encryptName = "userName=s%3AJohn.qXf9H6bVjCWAee5XCH6JqByqCUvloTtIa%2BzVGRfCeDo";
			var cookie = request.cookie(encryptName);
			jar.setCookie(cookie,"http://localhost:"+app.get('port'));
			request({
				url: "http://localhost:"+app.get('port')+"/clearCookie",
				method: "POST",
				jar: jar
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert(checkUserNameCookieExpired(response.headers['set-cookie']),'it must remove cookie userName');
				done();
			});
		});
	});

});


/**
 * check if there is a command in header sent to client with regard to expiring the userName cookie  
 * @param {object} setcookie which contains a lot of orders to client (about cookie)
 */
function checkUserNameCookieExpired(setcookie){
	for(var i in setcookie){
		if(setcookie[i] === 'userName=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'){
			return true;
		}
	}
	return false;
}
/**
 * @fileoverview test /routes/index.js
 * @author itri453696@itri.org.tw (Woody)
 * @author itri453740@itri.org.tw (DaJen)
 */ 
/* Revision: 
 * 2016/7/13 (Woody and DaJen)
 *   1. add test module.index()
 *   2. add test module.logout()
 */

/**
 * use the same session key to set session while testing
 * @const 
 */
const SECRET_SIGN_KEY = '1j4ul4y94e93ejo ek6x87';

var sinon = require('sinon');
/**
 * a simplified HTTP request client.
 * @module request
 * @example
 * request(url, function (error, response, body) {
 *     // after connection process 
 * }
 * @param {object} response http response information
 * @param {string} body http response text
 */
var request = require('request');
var http = require('http');
var assert = require('chai').assert;
var express = require('express');
var path = require('path');
var SESSION = require('express-session');
var app = express();
var proxyquire = require('proxyquire').noCallThru();
var server;

var fakeSession = {
	destroySession: sinon.spy()
};

var fakeCookie = {
	destoryCookieofUserName: sinon.spy()
};

var index = proxyquire('../../routes/index',{
	'../lib/session.js': fakeSession,
	'../lib/cookie.js': fakeCookie
});

/**
 * for test routes/index.js
 */
suite('routes/index.js',function(){
	/**
	 * set the params to bulid a server to test index.js
	 */
	setup(function(){
		app.set('port',process.env.TEST_PORT || 2001);
		app.set('views', path.join(__dirname, '../views'));
		app.use(SESSION({secret: 'keyboard cat',resave: false,saveUninitialized: true}));
		app.set('view engine', 'ejs');
		app.use(express.cookieParser(SECRET_SIGN_KEY));
	});
	/**
	 * build server and create a http request to test module.index
	 */
	test('index: it should render a html file to response',function(done){
		app.get('/',index.index);
		server = http.createServer(app).listen(app.get('port'),function(){
			request('http://localhost:'+app.get('port'), function (error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(response.statusCode,200,'connection wrong');
				assert.equal(body,' ITRI ITP4 Web Portal','html content is incorrect');
				server.close();
				done();
			});
		});
	});
	/**
	 * test session.destroySession, cookie.destoryCookieofUserName and res.redirect is called and is called with correct arg
	 */
	test('logout: it should remove cookie, session and redirect to root directory',function(){
		var res = { redirect : sinon.spy() };
		var req = sinon.spy();
		index.logout(req,res);
		assert(fakeSession.destroySession.calledOnce, 'session.destroySession must be called once');
		assert(fakeSession.destroySession.calledWith(req), 'session.destroySession must be called with arg req');
		assert(fakeCookie.destoryCookieofUserName.calledOnce, 'cookie.destoryCookieofUserName must be called once');
		assert(fakeCookie.destoryCookieofUserName.calledWith(res),'cookie.destoryCookieofUserName must be called with arg res');
		assert(res.redirect.calledOnce, 'res.redirect must be called once');
		assert(res.redirect.calledWith('/'),'res.redirect must be called with string /');
	});
});

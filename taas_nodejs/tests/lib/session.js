/**
 * @fileoverview test /routes/session.js
 * @author itri453696@itri.org.tw (Woody)
 */ 

/**
 * use the same session key to set session while testing
 * @const 
 */
const SECRET_SIGN_KEY = '1j4ul4y94e93ejo ek6x87';

var request = require('request');
var http = require('http');
var assert = require('chai').assert;
var express = require('express');
var path = require('path');
var SESSION = require('express-session');
var app = express();
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var server;
var testPort = process.env.TEST_PORT || 2001;

var fakeLogging = {
	debug: sinon.spy(),
	log_routes: sinon.stub(),
	setLevel:sinon.spy()
}
fakeLogging.log_routes.returns(fakeLogging);

/**
 * stub /lib/logging.js module
 * @method proxyquire
 * @param fakeLogging replace original functions in /lib/logging.js with spies
 */
var session = proxyquire('../../lib/session.js',{
	'./logging' : fakeLogging
});

suite('lib/session.js',function(){
	/**
	 * set the params to bulid a server to test session.js
	 */
	suiteSetup(function(){
		app.set('port',testPort);
		app.set('views', path.join(__dirname, '../views'));
		app.use(SESSION({secret: 'keyboard cat',resave: false,saveUninitialized: true}));
		app.set('view engine', 'ejs');
		app.use(express.cookieParser(SECRET_SIGN_KEY));
	});
	teardown(function(){
		server.close();
		deleteRoute();
		fakeLogging.debug.reset();
	});
	test('checkLoginbySess: logined case ( depends getSessofEmail, getSessVarifyEmail',function(done){
		app.post('/checkLoginbySess',function(req,res){
			req.session.email = 'test@mail.com';
			req.session.varifyEmail = true;
			session.checkLoginbySess(req,res);
			res.end('nothing happens');
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/checkLoginbySess",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(response.statusCode,200,'status code wrong');
				assert(body == 'nothing happens','return values wrong');
				done();
			});
		});
	});
	test('checkLoginbySess: not logined case ( depends getSessofEmail, getSessVarifyEmail',function(done){
		app.post('/checkLoginbySess',function(req,res){
			req.session.email = undefined;
			req.session.varifyEmail = undefined;
			session.checkLoginbySess(req,res);
			res.end('nothing happens');
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/checkLoginbySess",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(fakeLogging.debug.getCall(1).args[0], 'checkLoginbySess: not login !', 'logSession.debug is called but args[0] is wrong');
				assert.equal(response.statusCode,302,'it must redirect the page');
				assert.equal(response.headers.location,'/','it must redirect the client to root directory');
				assert(body != 'nothing happens','it should not return value');
				done();
			});
		});
	});
	test('checkLoginbySessBool: logined case ( depends getSessofEmail, getSessVarifyEmail',function(done){
		app.post('/checkLoginbySessBool',function(req,res){
			req.session.email = 'test@mail.com';
			req.session.varifyEmail = true;
			if(session.checkLoginbySessBool(req,res) === true){
				res.end('1');
			}else{
				res.end('0');
			}
			res.end('nothing happens');
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/checkLoginbySessBool",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(response.statusCode,200,'status code wrong');
				assert(parseInt(body),'it must return true');
				done();
			});
		});
	});
	test('checkLoginbySessBool: not logined case ( depends getSessofEmail, getSessVarifyEmail',function(done){
		app.post('/checkLoginbySessBool',function(req,res){
			req.session.email = undefined;
			req.session.varifyEmail = undefined;
			if(session.checkLoginbySessBool(req,res) === false){
				res.end('1');
			}else{
				res.end('0');
			}
			res.end('nothing happens');
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/checkLoginbySessBool",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(fakeLogging.debug.getCall(1).args[0], 'checkLoginbySessBool: not login !', 'logSession.debug is called but args[0] is wrong');
				assert(parseInt(body),'it must return false');
				done();
			});
		});
	});
	test('setSessbyEmail: normal case',function(done){
		app.post('/setSessbyEmail',function(req,res){
			session.setSessbyEmail(req,'test@mail.com');
			res.end(req.session.email);
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/setSessbyEmail",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(body,'test@mail.com','email is not same');
				done();
			});
		});
	});
	test('getSessofEmail: normal case',function(done){
		app.post('/getSessofEmail',function(req,res){
			req.session.email = "test@mail.com";
			res.end(session.getSessofEmail(req));
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/getSessofEmail",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(body,'test@mail.com','email is not same');
				done();
			});
		});
	});
	test('setSessbyProjectID: normal case',function(done){
		app.post('/setSessbyProjectID',function(req,res){
			session.setSessbyProjectID(req,'testProjectId');
			res.end(req.session.selectProjectID);
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/setSessbyProjectID",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(fakeLogging.debug.getCall(0).args[0], 'set session: projID =testProjectId', 'logSession.debug is called but args[0] is wrong');
				assert.equal(body,'testProjectId','Project id is not same');
				done();
			});
		});
	});
	test('getSessofProjectID: normal case',function(done){
		app.post('/getSessofProjectID',function(req,res){
			req.session.selectProjectID = 'testProjectId';
			res.end(session.getSessofProjectID(req));
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/getSessofProjectID",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(fakeLogging.debug.getCall(0).args[0], 'get session : projID = testProjectId', 'logSession.debug is called but args[0] is wrong');
				assert.equal(body,'testProjectId','Project id is not same');
				done();
			});
		});
	});
	test('setSessbyProjectName: normal case',function(done){
		app.post('/setSessbyProjectName',function(req,res){
			session.setSessbyProjectName(req,'testProjectName');
			res.end(req.session.selectProjectName);
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/setSessbyProjectName",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(fakeLogging.debug.getCall(0).args[0], 'set session: projName = testProjectName', 'logSession.debug is called but args[0] is wrong');
				assert.equal(body,'testProjectName','Project name is not same');
				done();
			});
		});
	});
	test('getSessofProjectName: normal case',function(done){
		app.post('/getSessofProjectName',function(req,res){
			req.session.selectProjectName = 'testProjectName';
			res.end(session.getSessofProjectName(req));
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/getSessofProjectName",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert.equal(fakeLogging.debug.getCall(0).args[0], 'get session : projName = testProjectName', 'logSession.debug is called but args[0] is wrong');
				assert.equal(body,'testProjectName','Project name is not same');
				done();
			});
		});
	});
	test('destroySession: normal case',function(done){
		app.post('/destroySession',function(req,res){
			req.session.email = 'email@gmail.com';
			session.destroySession(req);
			if(req.session === undefined){
				res.end('1');
			}else{
				res.end('0');
			}
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/destroySession",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert(parseInt(body),'session in backend was not destroyed');
				assert(checkUserSessionDestroyed(response.headers['set-cookie']),'it must destroy session object at backend');
				done();
			});
		});
	});
	test('setSessVarifyEmail: normal case',function(done){
		app.post('/setSessVarifyEmail',function(req,res){
			session.setSessVarifyEmail(req);
			if(req.session.varifyEmail === true){
				res.end('1');
			}else{
				res.end('0');
			}
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/setSessVarifyEmail",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert(parseInt(body),'setSessVarifyEmail must return true');
				assert.equal(fakeLogging.debug.getCall(0).args[0],"set session : varifyEmail = true", 'logging.debug is called but args[0] is wrong');
				done();
			});
		});
	});
	test('getSessVarifyEmail: normal case',function(done){
		app.post('/getSessVarifyEmail',function(req,res){
			req.session.varifyEmail = true;
			if(session.getSessVarifyEmail(req) === true){
				res.end('1');
			}else{
				res.end('0');
			}
		});
		server = http.createServer(app).listen(app.get('port'),function(){
			request({
				url: "http://localhost:"+app.get('port')+"/getSessVarifyEmail",
				method: "POST",
			}, function(error, response, body) {
				assert.isNotOk(error,error);
				assert(parseInt(body),'getSessVarifyEmail must return true');
				assert.equal(fakeLogging.debug.getCall(0).args[0],"get session : varifyEmail = true", 'logging.debug is called but args[0] is wrong');
				done();
			});
		});
	});
});

/**
 * check if there isn't a command in header sent to client with regard to store the connect.sid cookie
 * @param {object} setcookie which contains a lot of orders to client (about cookie)
 */
function checkUserSessionDestroyed(setcookie){
	for(var i in setcookie){
		if(setcookie[i].substring(0,12) == 'connect.sid='){
			return false;
		}
	}
	return true;
}
/**
 * remove all the router of express app
 * @method
 */
function deleteRoute() {
	for (var i = app.routes.post.length - 1; i >= 0; i--) {
		app.routes.post.splice(i, 1);
	}
}
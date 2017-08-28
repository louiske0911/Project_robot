/**
 * @fileoverview test /lib/render.js
 * @author itri453696@itri.org.tw (Woody)
 */

var sinon = require('sinon');
var proxyquire = require('proxyquire');
var assert = require('chai').assert;

var fakeMongoose = {
	model: sinon.stub()
}
var fakeMongoSchema = {
	find: sinon.stub(),
	exec: sinon.stub(),
	findById: sinon.stub()
}
var fakeSession = {
	getSessofEmail: sinon.stub(),
	getSessofProjectID: sinon.stub()
}
var fakeRes = {
	render: sinon.stub()
}
var fakeCookie = {
	getCookieofUserName: sinon.stub()
}
var fake_ = {
	extend: sinon.stub()
}

suite('lib/render.js',function(){
	test('render: has selected project case',function(){
		var fakeReq = 'fakereq';
		var fakeSessionEmail = 'fakeemail';
		var fakeProjectId = 'fakeprojectid';
		var fakeProjectInfo = {proj_name:'fakeproject2'};
		var fakeProjectInfos = [
			{proj_name:'fakeproject1'},
			{proj_name:'fakeproject2'}
		];
		var fakeView = 'fakeindex';
		var fakeTitle = 'fakeTitle';
		var fakeJson = {fake:'i m fake'};
		var fakeUsername = 'fakeusername';
		var fakeBasic = {
			title: fakeTitle,
			userName: fakeUsername,
			projs: fakeProjectInfos,
			selectProj: fakeProjectInfo.proj_name
		};

		fakeSession.getSessofEmail.withArgs(fakeReq).returns(fakeSessionEmail);
		fakeMongoose.model.returns(fakeMongoSchema);
		fakeMongoSchema.find.withArgs({email:fakeSessionEmail}).returns(fakeMongoSchema);
		fakeMongoSchema.exec.callsArgWith(0,null,fakeProjectInfos);
		fakeSession.getSessofProjectID.withArgs(fakeReq).returns(fakeProjectId);
		fakeCookie.getCookieofUserName.withArgs(fakeReq).returns(fakeUsername);
		fakeMongoSchema.findById.callsArgWith(1,null,fakeProjectInfo);
		fake_.extend.returns(fake_.extend);

		var render = proxyquire('../../lib/render.js',{
			'mongoose': fakeMongoose,
			'./session.js' : fakeSession,
			'./cookie.js' : fakeCookie,
			'underscore' : fake_
		});

		render.render(fakeReq,fakeRes,fakeView,fakeTitle,fakeJson);

		assert(fakeSession.getSessofEmail.calledOnce,'session,getSessofEmail must be called once');
		assert.equal(fakeSession.getSessofEmail.getCall(0).args[0],fakeReq,'session,getSessofEmail is called with wrong argument');
		assert(fakeMongoSchema.find.calledOnce,'Project.find must be called once');
		assert.equal(JSON.stringify(fakeMongoSchema.find.getCall(0).args[0]),JSON.stringify({email:fakeSessionEmail}),'Project.find is called with wrong argument');
		assert(fakeMongoSchema.exec.calledOnce,'Project.exec must be called once');
		assert(fakeSession.getSessofProjectID.callCount == 2,'session.getSessofProjectID must be called twice');
		assert(fakeSession.getSessofProjectID.alwaysCalledWith(fakeReq),'session.getSessofProjectID is called with wrong argument');
		assert(fakeMongoSchema.findById.calledOnce,'Project.findById must be called once');
		assert.equal(fakeMongoSchema.findById.getCall(0).args[0],fakeProjectId,'Project.findById is called with wrong argument');
		assert(fakeCookie.getCookieofUserName.calledOnce,'cookie.getCookieofUserName must be called once');
		assert.equal(fakeCookie.getCookieofUserName.getCall(0).args[0],fakeReq,'cookie.getCookieofUserName is called with wrong argument')
		assert(fakeRes.render.calledOnce,'res.render must be called once');
		assert.equal(fakeRes.render.getCall(0).args[0],fakeView,'res.render is called with wrong argument');
		assert.equal(fakeRes.render.getCall(0).args[1],fake_.extend,'res.render is called with wrong argument');
		assert(fake_.extend.calledOnce,'_.extend must be called once');
		assert.equal(JSON.stringify(fake_.extend.getCall(0).args[0]),JSON.stringify(fakeBasic),'_.extend is called with wrong argument');
		assert.equal(JSON.stringify(fake_.extend.getCall(0).args[1]),JSON.stringify(fakeJson),'_.extend is called with wrong argument');
	});
});
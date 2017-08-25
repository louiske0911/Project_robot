/**
 * @fileoverview test /lib/logging.js
 * @author itri453740@itri.org.tw (DaJen)
 */ 
/* 
 * 2016/7/14 (DaJen)
 *   1. add test module.formatTime()
 *   2. add test module.formatDateTime()
 */

var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var fakeConfig = {
	get : function(system_timezone) { return 'Asia/Taipei' },
}
var fakeMoment = {
	tz : function (timestamp,timezone){

	},
}
var time = proxyquire('../../lib/time.js',{
	//'moment-timezone' : fakeMoment,
	'./config' : fakeConfig
});
var fakeTimeStamp 	= 1468548627; //1970-01-18 07:55:48
var fakeFormatStr 	= 'YYYY-MM-DD HH:mm:ss';
var fakeFormatDateStr = 'YYYY-MM-DD';
var fakeFormatTimeStr = 'HH:mm:ss';
var fakeTimezone 	= 'Asia/Taipei';
var fakeReturnValue = '1970-01-18 07:55:48';

/**
 * for test lib/time.js
 */
suite('lib/time.js',function(){

	test('formatTime: normal case',function(done){
		var result	=	time.formatTime(fakeTimeStamp,fakeFormatStr,fakeTimezone);
		assert.equal(result,fakeReturnValue,'it must return the datatime format');
		done();
	});

	test('formatTime: no parameter formatStr ',function(done){
		var result	=	time.formatTime(fakeTimeStamp,null,fakeTimezone);
		assert.equal(result,fakeReturnValue,'it must return the datatime format');
		done();
	});

	test('formatTime: no parameter timezone ',function(done){
		var result	=	time.formatTime(fakeTimeStamp,fakeFormatStr,null);
		assert.equal(result,fakeReturnValue,'it must return the datatime format');
		done();
	});

	test('formatTime: no parameter formatStr and timezone ',function(done){
		var result	=	time.formatTime(fakeTimeStamp,null,null);
		assert.equal(result,fakeReturnValue,'it must return the datatime format');
		done();
	});

});

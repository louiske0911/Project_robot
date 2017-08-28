var cookie = require('cookie-parser');

//set cookie by userName
var setCookiebyUserName = function(res, name) { //set session by email
	res.cookie('userName', name, {
		signed: true
	});
};

//get cookie of userName
var getCookieofUserName = function(req) {
	return req.signedCookies['userName'];
};

//clear cookie of userName
var destoryCookieofUserName = function(res) {
	return res.clearCookie('userName');
};

//setting module for require
module.exports = {
	setCookiebyUserName: setCookiebyUserName,
	getCookieofUserName: getCookieofUserName,
	destoryCookieofUserName: destoryCookieofUserName
};
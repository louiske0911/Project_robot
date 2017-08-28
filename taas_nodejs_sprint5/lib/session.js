/*
 * session
 * @fileoverview This file has functions related to setting session and getting session.
 * 2016/01/28(Kristen)
 * add destroySession
 * 2016/01/22(Kristen)
 * initial
 */

var SESSION = require('express-session');
var logging = require('./logging'); //require logger module
logSession = logging.log_routes('Session'); // Set up Category
logSession.setLevel('all'); //set logger level

// check the session is set or not

var checkLoginbySess = function(req, res) {
  var sess = req.session;
  if (!getSessofEmail(req) && (!getSessVarifyEmail(req))) {
    logSession.debug('checkLoginbySess: not login !' );
    res.redirect('/');
  } else {
    //console.log("get session : email = " + sess.email);
  }
}

var checkLoginbySessBool = function(req) {
  var sess = req.session;
  if (!getSessofEmail(req) && (!getSessVarifyEmail(req))) {
    logSession.debug('checkLoginbySessBool: not login !' );
    return false
  } else {
    //console.log("get session : email = " + sess.email);
    return true;
  }
}

//set session by email
var setSessbyEmail = function(req, email) { //set session by email
  var sess = req.session;
  sess.email = email;
  //console.log("set session : email = " + email);
}

//get session of email
var getSessofEmail = function(req) {
  var sess = req.session;
  //console.log("get session : email = " + sess.email);
  return sess.email;
}

//set session by projectID
var setSessbyProjectID = function(req, projID) {
  var sess = req.session;
  sess.selectProjectID = projID;
  logSession.debug('set session: projID =' + sess.selectProjectID);
  //console.log('set session: projID = ' + sess.selectProjectID);
}

//get session of projectID
var getSessofProjectID = function(req) {
  var sess = req.session;
  logSession.debug("get session : projID = " + sess.selectProjectID);
  //console.log("get session : projID = " + sess.selectProjectID);
  return sess.selectProjectID;
}

//set session by projectName
var setSessbyProjectName = function(req, projName) {
  var sess = req.session;
  sess.selectProjectName = projName;
  logSession.debug('set session: projName = ' + sess.selectProjectName);
  //console.log('set session: projName = ' + sess.selectProjectName);
}

//get session of projectName
var getSessofProjectName = function(req) {
  var sess = req.session;
  logSession.debug("get session : projName = " + sess.selectProjectName);
  //console.log("get session : projName = " + sess.selectProjectName);
  return sess.selectProjectName;
}

//destroy session 
var destroySession = function(req) {
  req.session.destroy();
}

//set session by varify email = true
var setSessVarifyEmail = function(req) { //set session by email
  var sess = req.session;
  sess.varifyEmail = true;
  logSession.debug("set session : varifyEmail = true");
  //console.log("set session : varifyEmail = true");
}

//get session by varify email
var getSessVarifyEmail = function(req) {
  var sess = req.session;
  logSession.debug("get session : varifyEmail = " + sess.varifyEmail);
  //console.log("get session : varifyEmail = " + sess.varifyEmail);
  return sess.varifyEmail;
}

//set session by permission 2017.8.17 Tony
var setSessbyPermission = function(req, permission) {
  var sess = req.session;
  sess.selectPermission = permission;
  logSession.debug('set session: permission = ' + sess.selectPermission);
}
//get session of permission 2017.8.17 Tony
var getSessofPermission = function(req) {
    var sess = req.session;
    logSession.debug("get session : permission = " + sess.selectPermission);
    return sess.selectPermission;
}

var setSessbyPermIndex = function(req, permIndex) {
    var sess = req.session;
    sess.selectPermIndex = permIndex;
}

var getSessofPermIndex = function(req) {
    var sess = req.session;
    return sess.selectPermIndex;
}

//setting module for require
module.exports = {
  checkLoginbySess: checkLoginbySess,
  checkLoginbySessBool: checkLoginbySessBool,
  setSessbyEmail: setSessbyEmail,
  getSessofEmail: getSessofEmail,
  setSessbyProjectID: setSessbyProjectID,
  getSessofProjectID: getSessofProjectID,
  setSessbyProjectName: setSessbyProjectName,
  getSessofProjectName: getSessofProjectName,
  setSessVarifyEmail: setSessVarifyEmail,
  getSessVarifyEmail: getSessVarifyEmail,
  destroySession: destroySession,
  setSessbyPermission: setSessbyPermission,
  getSessofPermission: getSessofPermission,
  setSessbyPermIndex: setSessbyPermIndex,
  getSessofPermIndex: setSessbyPermIndex
}
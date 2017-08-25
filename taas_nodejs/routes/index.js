/*
 * index/login/signup
 * @fileoverview This file has functions related to index/login/signup.
 * Rivision:
 * 2016/01/30(Kristen)
 *  assign a ip to variable C_IP for mail user click to return Taas Address.
 * 2016/01/28(Kristen)
 *  add session, mailer for signup, login.
 *  add varify mail to function : exports.index
 *  add function : exports.verifylgByMail
 * 
 * 
 *  
 *
 */

var MONGOOSE = require('mongoose');
var CRYPTO = require('crypto');
var PROJECT = MONGOOSE.model('project');
var USERINFO = MONGOOSE.model('userinfo');
var LDAP = require('./itrildap');
var ObjectID = require('mongodb').ObjectID;
var session = require('../lib/session.js');
var cookie = require('../lib/cookie.js');
var MAILER = require("../lib/mailer.js");
var conf = require('../lib/config');
const HOSTIP = conf.get('host_address');


/**
 * Direct to index/login page.
 */
exports.index = function(req, res) {
  var htmlMsg = '';
  res.render('index', {
    title: 'ITRI ITP4 Web Portal',
    htmlMsg: htmlMsg
  });
};

/**
 * Clear the cookies and direct to index/login page.
 */
exports.logout = function(req, res) {
  session.destroySession(req);
  cookie.destoryCookieofUserName(res);
  res.redirect('/');
};

/**
 * LDAP login. If someone authenticates success, it returns "success". Otherwise, it returns error message.
 */
exports.ldaplogin = function(req, res) {
  if (req.body.ldapUser == '' || req.body.ldapPassword == '') {
    loginMsg = 'Please input your username and password.';
    res.end(loginMsg);
  } else {
    LDAP.fLdapAuth(req.body.ldapUser, req.body.ldapPassword, function(err, data) {
      if (err) {
        // Authentication failed
        loginMsg = 'Fail! Please login again.';
        res.end(loginMsg);
      } else {
        // Authentication success
        session.setSessbyEmail(req, data.mail);
        session.setSessVarifyEmail(req);
        cookie.setCookiebyUserName(res, data.sn);
        res.end('success');
      }
    });
  }
};

/**
 * Verify log by email.
 */
exports.verifylgByMail = function(req, res) {
  USERINFO.findById(req.params.id, function(err, userinfo) {
    if (userinfo) {
      if (err) {
        console.log("[verifylgByMail] " + err);
        loginMsg = 'Authentication failed.';
      } else {
        userinfo.verifyEmail = true;
        userinfo.save(console.log("verifyEMail success!")); // save in to db
        session.setSessVarifyEmail(req); // write in to session 
        loginMsg = 'Please login your account.';
      }
    } else
      loginMsg = 'Authentication failed.';

    res.render('index', {
      title: 'ITRI ITP4 Web Portal',
      htmlMsg: loginMsg
    });
  });
};

/**
 * Verify login.
 */
exports.verifylogin = function(req, res) {
  var md5 = CRYPTO.createHash('md5'),
    pass_word = md5.update(req.body.password).digest('hex');

  USERINFO.findOne({
    name: req.body.user,
    password: pass_word
  }, null, {
    safe: true
  }, function(err, userinfo) {
    if (userinfo) {
      session.setSessbyEmail(req, userinfo.email);
      cookie.setCookiebyUserName(res, req.body.user);
      if (userinfo.verifyEmail === false) {
        // show message to verify mail
        loginMsg = 'Please verify your mail and login account.';
        res.end(loginMsg);
      } else {
        session.setSessVarifyEmail(req);
        res.end('success');
      }
    } else {
      // show message to verify mail
      loginMsg = 'Fail! Please login again.';
      res.end(loginMsg);
    }
  });
};

/**
 * Verify sign up. Check the input data and decide the applicant can be a member or not.
 * If yes, put data into database (not certified).
 */
exports.verifysignup = function(req, res) {
  // console.log('debug: verifysignup......');
  console.log(req.body.signUpPassword);
  var md5 = CRYPTO.createHash('md5'),
    pass_word = md5.update(req.body.signUpPassword).digest('hex');

  var timestamp = Math.floor(new Date().getTime() / 1000);
  var objectId = new ObjectID(timestamp);
  var timestring = objectId.getTimestamp().toString();

  var user_attribute = new USERINFO({
    name: req.body.signUpUser,
    password: pass_word,
    email: req.body.signUpEmail,
    createtime: timestring,
    verifyEmail: false
  });

  USERINFO.find({
    name: req.body.signUpUser,
  }, function(err, results) {
    if (results == null || results == "") { // no this man

      USERINFO.find({
        email: req.body.signUpEmail,
      }, function(err, results) {
        if (results == null || results == "") { // no this EMAIL, could mail to this person

          user_attribute.save(function(err, userinfo, num) { //save to db
            if (err) {
              loginMsg = 'email or name already exists.';
              res.end(loginMsg);
            } else {
              // sending mail
              var mailSubj = "ITRI Test Protal (ITP4)";
              var mailHtml = '<p>Hi ' + userinfo.name + ',</p><h2>Welcome to join ITP4!</h2> <p>Please enter this link to <a href="'+ HOSTIP + '/verifylgByMail/' + userinfo._id + '">verify your account</a>.</p>';

              //var options = MAILER.setMail(MAILER.C_AUTH,req.body.email,mailSubj,mailHtml);
              var options = MAILER.setMail(mailSubj, userinfo.email, mailSubj, mailHtml);
              MAILER.transporter.sendMail(options, function(error, info) {
                if (error) {
                  loginMsg = 'Fail! Please singup again!';
                  USERINFO.findById(userinfo._id, function(err, doc) {
                    if (err) {
                      // handle error
                    }
                    doc.remove(); // Remove from db
                  });
                  res.end(loginMsg);
                  console.log(error);
                } else { // mail success could save this account to db
                  session.setSessbyEmail(req, userinfo.email);
                  loginMsg = 'Success! Please verify your mail and login account.';
                  res.end(loginMsg);
                  console.log('send: success!.' + info.response);
                }
              });
            }
          });
        } else {
          loginMsg = 'email already exists.';
          res.end(loginMsg);
        }
      });
    } else {
      loginMsg = 'username already exists.';
      res.end(loginMsg);
    }
  });
};
/**
* nodemailer
* @fileoverview This file has functions related to sending mail.
*
* Rivision:
* 2016/1/26(Kristen)
*  initial version.
*
*
*/

//set mail server detail
const C_NODEMAILER = require('nodemailer'); 
const C_AUTH = "pdcm.ccma@gmail.com";
const C_PASS = "ykelaiqyprsgtavf";
const C_GMAILHOST = "smtp.gmail.com";


//set mail sending detail
var transporter = C_NODEMAILER.createTransport("SMTP", {
    host: C_GMAILHOST, // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: C_AUTH,
        pass: C_PASS
    }
});

//set mail to mailer
var setMail = function (mailFrom,mailTo,mailSubj,mailHtml){
    var options = {
       from: mailFrom,
         to: mailTo, 
    subject: mailSubj, // Subject line
       html: mailHtml
    };
    
    return options;
};

//export mail class for called
module.exports = {
	setMail : setMail,
  transporter : transporter
};

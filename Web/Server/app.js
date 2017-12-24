var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var schedule = require('node-schedule')

// Import API endpoint
var college = require('./routes/api/fcu/college');
var bulletin = require('./routes/api/fcu/bulletin');
var building = require('./routes/api/fcu/building');
var landscape = require('./routes/api/fcu/landscape');
var location = require('./routes/api/fcu/location');

var app = express();

// Connect to Mongoose
mongoose.connect('mongodb://localhost:27017/FcuDB', {
    useMongoClient: true,
});
var db = mongoose.connection;
db.once('open', function() {
    console.log("Database Connected.");
}).on('error', function(error) {
    console.log("DB Connect Error:", error);
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../UI')));

// Export API endpoint
app.use('/api/fcu/college', college);
app.use('/api/fcu/bulletin', bulletin);
app.use('/api/fcu/building', building);
app.use('/api/fcu/landscape', landscape);
app.use('/api/fcu/location', location);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//parser fcu bulletin page every one hour 
var j = schedule.scheduleJob('* */1 * * *', function() {
    console.log('Parser the Bulletin Data ....');
    var bulletinData = require('./bulletin_parser.js')
});

module.exports = app;
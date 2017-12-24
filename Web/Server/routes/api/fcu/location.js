// This API only support for collect campus data
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../../../location2.json');
var data = JSON.parse('{}')

/* POST */
router.post('/', function(req, res, next) {
    data = {}
    data['magnitude'] = req.body['magnitude'];
    data['Lat'] = req.body['Lat']
    data['Lng'] = req.body['Lng']
    console.log(data)
    console.log(config['data'].length)
    config['data'].push(data)

    fs.writeFileSync("./location2.json", JSON.stringify(config));
    res.json('Post Successfully.');
});

module.exports = router;
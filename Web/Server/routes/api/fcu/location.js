var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../../../location2.json');
var data = JSON.parse('{}')

router.get('/:id', function(req, res, next) {
    var data = []
    College.findById('59ec2cec2353f42374b14655', function(err, college) {
        if (err) {
            console.log(err);
            return next(err);
        }
        let data = {
            name: college['college_name'],
            building: college['college_location']['college_building'],
            info: college['info']
        }
        res.json(data);
    });
});

/* POST */
router.post('/', function(req, res, next) {
    // console.log(req.body)
    data = {}
    data['magnitude'] = req.body['magnitude'];
    data['Lat'] = req.body['Lat']
    data['Lng'] = req.body['Lng']
        // data['acceleration'] = {}
        // data['acceleration']['X'] = req.body['X']
        // data['acceleration']['Y'] = req.body['Y']
        // data['acceleration']['Z'] = req.body['Z']
    console.log(data)
    console.log(config['data'].length)
    config['data'].push(data)

    fs.writeFileSync("./location2.json", JSON.stringify(config));
    res.json('Post Successfully.');
});

module.exports = router;

//mongodb -> ensureIndex({})
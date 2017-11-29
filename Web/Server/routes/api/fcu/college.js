var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var College = require('../../../modules/schema/College.js');
var config = require('../../../college.json');

/* GET */
router.get('/', function (req, res, next) {
    // College.find({}, function (err, colleges) {
    //     if (err) {
    //         console.log(err);
    //         return next(err);
    //     }
    //     console.log(colleges);
    //     res.json(colleges);
    // });
    let data = [];
    for (var index = 0; index < config.length; index++) {
        let introduction = config[index]['info']['introduction']
        if (introduction)

            data.push({
                id: config[index]['_id'],
                name: config[index]['college_name'],
                location: {
                    building: config[index]['college_location']['college_building'],
                    latitude: config[index]['college_location']['location']
                },
                info: {
                    introduction: introduction,
                    image: config[index]['info']['image']
                }
            })
    }
    res.json(data)
});

router.get('/:id', function (req, res, next) {
    var data = []
    College.findById('59ec2cec2353f42374b14655', function (err, college) {
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
router.post('/', function (req, res, next) {
    var college_test;

    for (var i = 0; i < config.length; i++) {
        college_test = new College(config[i]);

        College.create(college_test, function (err, post) {
            if (err) {
                console.log(err);
                return next(err);
            }
        });
    }
    console.log('Post Successfully.\n');
    res.json('Post Successfully.\n');
});

module.exports = router;

//mongodb -> ensureIndex({})
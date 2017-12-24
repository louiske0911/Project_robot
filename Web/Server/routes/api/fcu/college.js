var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var College = require('../../../modules/schema/College.js');
var config = require('../../../college.json');

/* GET */
// get all college info from db
router.get('/', function(req, res, next) {
    let data = [];
    for (var index = 0; index < config.length; index++) {
        let introduction = config[index]['info']['introduction']
        if (introduction)
            data.push({
                id: config[index]['_id'],
                name: config[index]['college_name'],
                location: {
                    building: config[index]['college_location']['college_building'],
                    location: config[index]['college_location']['location'].replace(' ', '')
                },
                info: {
                    introduction: introduction,
                    image: config[index]['info']['image']
                }
            })
    }
    res.json(data)
});

// get specify college id info from db
router.get('/:id', function(req, res, next) {
    let data
    config.forEach(element => {
        if (req.params.id == element._id) {
            data = {
                name: element['college_name'],
                building: element['college_location']['college_building'],
                info: element['info']
            }
            return
        }
    });
    console.log(data)
    res.json(data);
});

/* POST */
router.post('/', function(req, res, next) {
    var college_test;

    for (var i = 0; i < config.length; i++) {
        college_test = new College(config[i]);

        College.create(college_test, function(err, post) {
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
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Building = require('../../../modules/schema/Building.js');

/* GET */
router.get('/', function (req, res, next) {
    Building.find({}, function (err, buildings) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log(buildings);
        res.json(buildings);
    });

});

router.get('/:id', function (req, res, next) {
    Building.findById(req.params.id, function (err, building) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log(building);
        res.json(building);
    });
});

/* POST */
router.post('/', function (req, res, next) {
    Building.create(req.body, function (err, post) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log('Post Successfully.\n' + post);
        res.json(post);
    });
});

module.exports = router;

//ensureIndex({})
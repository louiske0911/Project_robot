var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var Bulletin = require('../../../modules/schema/Bulletin.js');
var router = express.Router();

/* GET */
router.get('/', function (req, res, next) {
    var config = require('../../../bulletin.json');
    console.log(config);
    res.json(config);
});

router.get('/:id', function (req, res, next) {
    Bulletin.findById(req.params.id, function (err, bulletin) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log(bulletin);
        res.json(bulletin);
    });
});

/* POST */
router.post('/', function (req, res, next) {
    Bulletin.create(req.body, function (err, post) {
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
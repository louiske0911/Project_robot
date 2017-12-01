var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Landscape = require('../../../modules/schema/Landscape.js');
var config = require('../../../landscape.json');

/* GET */
router.get('/', function (req, res, next) {
    let data = [];
    for (var index = 0; index < config.length; index++) {
        let introduction = config[index]['info']['introduction']
        if (introduction)
            data.push({
                id: config[index]['_id'],
                name: config[index]['landscape_name'],
                location: {
                    location: config[index]['landscape_location']['location'].replace(' ', '')
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
    let data
    config.forEach(element => {
        if (req.params.id == element._id) {
            data = {
                name: element['landscape_name'],
                info: element['info']
            }
            return
        }
    });
    console.log(data)
    res.json(data);
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
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var College = require('../../../modules/schema/College.js');

var college_test = new College({
    _college_id: 1,
    college_name: "商學院",
    college_location: {
        college_building: "商學大樓",
        latitude: 123,
        longitude: 123
    },
    info: {
        introduction: "test",
        image: "test",
        department: {
            department_type: "學士班",
            department_list: [
                {
                    department_name: "會計學系",
                    department_url: "http://www.acct.fcu.edu.tw/wSite/mp?mp=420101"
                },
                {
                    department_name: "經濟學系",
                    department_url: "http://www.econ.fcu.edu.tw/wSite/mp?mp=445101"
                }
            ]
        },
    }
})

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
    var config = require('../../../college.json');
    let data = [];

    for (var index = 0; index < config.length; index++) {
        let introduction = config[index]['info']['introduction'][0].substr(0, 100);
        //parser only 100 words in front of this string 
        data.push({
            name: config[index]['college_name'],
            location: {
                building: config[index]['college_location']['college_building'],
                latitude: config[index]['college_location']['latitude'],
                longitude: config[index]['college_location']['longitude']
            },
            info: {
                introduction: introduction,
                image: config[index]['info']['image']
            }
        })
    }
    res.json(data);
});

router.get('/:id', function (req, res, next) {
    College.findById(req.params.id, function (err, colleges) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log(colleges);
        res.json(colleges);
    });
});

/* POST */
router.post('/', function (req, res, next) {
    College.create(req.body, function (err, post) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log('Post Successfully.\n' + post);
        res.json(post);
    });
});

module.exports = router;

//mongodb -> ensureIndex({})
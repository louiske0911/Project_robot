var async = require('async');
var requset = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

const FCU_URL = 'http://www.fcu.edu.tw/wSite/mp?mp=1';
const NEWS_URL = 'http://news.fcu.edu.tw/wSite/mp?mp=9000';

var listInfo = JSON.parse('{}');
var typeObj = {
    id: ['npanel_1', 'npanel_2', 'npanel_3', 'npanel_4'],
    type: ['News', 'Announce', 'Activity', 'Lecture']
}

var ParserFCUInfo = function (typeObj) {
    for (let i = 0; i < typeObj.type.length; i++) {
        requset(NEWS_URL, function (error, response, body) {
            let list = [];

            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(body);
                let index = '#npanel_' + (i + 1);
                let parser = '#tabpanel_1 ' + index + ' .headline .body h3 a'

                $(parser).each(function (index, title) {
                    list.push({
                        title: $(this).text(),
                        url: $(this).attr('href')
                    });
                });
            } else {
                console.log(error);
            }
            console.log(typeObj['type'][i]);
            listInfo[typeObj['type'][i]] = list;
        })
    }
}

var ParserFCUCarousel = function () {
    requset(FCU_URL, function (error, response, body) {
        var carouselList = [];

        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body);
            $('.Single_slider div a').each(function (index, title) {
                carouselList.push({
                    title: $(this).children('img').attr('alt'),
                    image: 'http://www.fcu.edu.tw/wSite/' + $(this).children('img').attr('src')
                });
            });
        } else {
            console.log(error);
        }
        console.log('Carousel');
        listInfo['Carousel'] = carouselList;
    })
}

ParserFCUInfo(typeObj);
ParserFCUCarousel();
setTimeout(function () {
    console.log("Export Bulletin Data...")
    fs.writeFileSync("bulletin.json", JSON.stringify(listInfo));
}, 15000)


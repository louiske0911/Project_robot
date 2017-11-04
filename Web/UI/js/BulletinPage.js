const BULLETIN_URL = 'http://2377ea38.ngrok.io/api/fcu/bulletin';
const bulletin = {
    paragraph: ['校園新聞', '校園公告', '校園活動', '校園演講'],
    type: ['News', 'Announce', 'Activity', 'Lecture']
}

const iconList = [
    'icon-newspaper',
    'icon-bullhorn',
    'icon-accessibility',
    'icon-user-tie'
];

var bulletinList = JSON.parse('{}');
var titleList = {
    News: [],
    Announce: [],
    Activity: [],
    Lecture: []
}

function AddCard(bulletinList) {
    /*************************Loader prepend to tag:body*************************/
    let titleHtml = []
    var col = '<div class="col-10 col-xl-10 rounded"></div>';
    $('#inner_bg').prepend(col);
    var row = '<div id="row" class="row"></div>';
    $('#inner_bg').append(row);

    for (var i = 0; i < 4; i++) {
        for (var y = 0; y < 3; y++) {
            titleList[bulletin.type[i]].push(
                // '<p class="card-title"><a href="SendWebviewURL(' + bulletinList[bulletin.type[i]][y]['url'] + ')">'
                // + bulletinList[bulletin.type[i]][y]['title'] + '</p>'
                '<p class="card-title"><a href="javascript:SendWebviewURL(\'' + bulletinList[bulletin.type[i]][y]['url'] + '\')">'
                + bulletinList[bulletin.type[i]][y]['title'] + '</p>'
            )
        }
        titleHtml.push(
            titleList[bulletin.type[i]][0] + titleList[bulletin.type[i]][1] + titleList[bulletin.type[i]][2]
        )
    }
    console.log(bulletinList['Carousel'])
    AddCarousel(bulletinList['Carousel']);
    /*************************Insert the card*************************/
    for (var i = 0; i < bulletin.paragraph.length; i++) {
        $('<div class="col-md-12 col-xl-6 mb-4">'
            + '<div class="card h-100 mb-3 message_container">'
            + '<div id="card_header" class="card-header d-flex justify-content-between">'
            + bulletin.paragraph[i]
            + '<a class="message_icon" href="#">'
            + '<span id="icon" class="">' + iconList[i] + '</span>'
            + '</a>'
            + '</div>'
            + '<div id="card_body" class="card-body">'
            + titleHtml[i]
            + '</div>'
            + '<div class="card-footer d-flex  justify-content-end ftr">'
            + '<a>..More</a>'
            + '</div>'
            + '</div>'
            + '</div>').appendTo('#row');
    }
}

function AddCarousel(imgList) {
    var carousel_inner = '<div class="carousel slide" id="carouselExampleControls_mainpage" data-ride="carousel">'
        + '<div id="carousel_item" class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">'
        + '<ul class="carousel-indicators"></ul>'
        + '<a class="carousel-control-prev" href="#carouselExampleControls_mainpage" role="button" data-slide="prev">'
        + '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'
        + '<span class="sr-only">Previous</span>'
        + '</a>'
        + '<a class="carousel-control-next" href="#carouselExampleControls_mainpage" role="button" data-slide="next">'
        + '<span class="carousel-control-next-icon" aria-hidden="true"></span>'
        + '<span class="sr-only">Next</span>'
        + '</a></div></div>';
    $('#inner_bg').prepend(carousel_inner);

    /*************************Isert the carousel item*************************/
    for (var i = 0; i < (imgList.length); i++) {
        $('<div class="carousel-item item_container">'
            + '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center"> <img class="d-block img-fluid carousel_img" src=" '
            + imgList[i]['image']
            + '"></div></div>').prependTo('#carousel_item');

        $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
    }

    $('.carousel-item.item_container').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carousel').carousel();
}

function getBulletin() {
    fetch(BULLETIN_URL, {
        method: 'GET',
    }).then(function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }).then(function (data) {
        var bulletinList = data;
        AddCard(bulletinList);
        // data 才是實際的 JSON 資料
    }).catch(function (error) {
        return error.response;
    }).then(function (errorData) {
        // errorData 裡面才是實際的 JSON 資料
    });
}

function SendWebviewURL(url) {
    console.log(url)
    if (JSInterface) {
        JSInterface.sendWebviewURL(url);
    }
}

function GoolgeMap() {
    if (JSInterface) {
        JSInterface.showToast();
    }
}

function test() {
    getBulletin();
}
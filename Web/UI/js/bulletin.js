const bulletin = {
    paragraph: ['校園新聞', '校園公告', '校園活動', '校園演講'],
    type: ['News', 'Announce', 'Activity', 'Lecture']
}

const iconList = [
    'fa fa-newspaper-o',
    'fa fa-bullhorn',
    'fa fa-users',
    'fa fa-file-text-o'
];

let bulletinList = JSON.parse('{}');
let titleList = {
    News: [],
    Announce: [],
    Activity: [],
    Lecture: []
}

function bulletinDialogShow() {
    document.getElementById("block").style.visibility = "visible";
    document.getElementById("bulletin_dialog").style.visibility = "visible";
}

function bulletinDialogBack() {
    document.getElementById("block").style.visibility = "hidden";
    document.getElementById("bulletin_dialog").style.visibility = "hidden";
}

function AddBuletinList(bulletinList) {
    /*************************Loader prepend to tag:body*************************/
    let titleHtml = []
    let col = '<div class="col-10 col-xl-10 rounded"></div>';
    let row = '<div id="bulletin_list" class="row"></div>';

    /* 
    container-fluid is only for Campus introfuction
    and should be change or remove this in all page
    */
    $('#outer_bg').removeClass('container-fluid').addClass('container');
    $('#outer_bg').append('<div id="inner_bg" class="ml-5 pl-5 row justify-content-center inner_background"></div>')

    $('#inner_bg').prepend(col);
    $('#inner_bg').append(row);

    for (let i = 0; i < 4; i++) {
        for (let y = 0; y < 5; y++) {
            titleList[bulletin.type[i]].push(
                '<p class="card-title">' +
                '<a href="javascript:OpenURL(\'' + bulletinList[bulletin.type[i]][y]['url'] + '\')">' +
                bulletinList[bulletin.type[i]][y]['title'] +
                '</a>' +
                '</p>'
            )
        }
        titleHtml.push(
            titleList[bulletin.type[i]][0] +
            titleList[bulletin.type[i]][1] +
            titleList[bulletin.type[i]][2] +
            titleList[bulletin.type[i]][3]
        )
    }
    AddCarousel(bulletinList['Carousel']);
    /*************************Insert the card*************************/
    for (let i = 0; i < bulletin.paragraph.length; i++) {
        $(
            '<div class="col-md-12 col-xl-6 mb-4">' +
            '<div class="card h-100 message_container">' +
            '<div class="card-header">' +
            '<a class="bulletin_title_icon">' +
            bulletin.paragraph[i] +
            '<span class="' + iconList[i] + ' float-right float-md-right"></span>' +
            '</a>' +
            '</div>' +
            '<div class="card-body">' +
            titleHtml[i] +
            '</div>' +
            '<div class="card-footer d-flex justify-content-end ftr">' +
            '<button class="btn btn-outline-secondary button_rwd" onclick="GetSpecificBulletin(\'' + bulletin.type[i] + '\')"' +
            '>More..</button>' +
            '</div>' +
            '</div>' +
            '</div>').appendTo('#bulletin_list');
    }
}

function AddCarousel(imgList) {
    let carousel_inner =
        '<div class="carousel slide" id="carouselExampleControls_mainpage" data-ride="carousel">' +
        '<div id="carousel_item" class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">' +
        '<ul class="carousel-indicators"></ul>' +
        '</div>' +
        '</div>';

    let carouselControlIcon =
        '<a class="carousel-control-prev" href="#carouselExampleControls_mainpage" role="button" data-slide="prev">' +
        '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
        '<span class="sr-only">Previous</span>' +
        '</a>' +
        '<a class="carousel-control-next" href="#carouselExampleControls_mainpage" role="button" data-slide="next">' +
        '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
        '<span class="sr-only">Next</span>' +
        '</a>'

    $('#inner_bg').prepend(carousel_inner);

    /*************************Isert the carousel item*************************/
    for (let i = 0; i < imgList.length; i++) {
        $('<div class="carousel-item item_container">' +
            '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-contern-center">' +
            '<img class="d-block img-fluid carousel_img" src=" ' +
            imgList[i]['image'] + '">' +
            '</div></div>').appendTo('#carousel_item');

        $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
    }

    $('#carousel_item').append(carouselControlIcon)
    $('.carousel-item.item_container').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carousel').carousel();
}

function getBulletin() {
    mapBlock = 0;

    $('#outer_bg').html("")
    $('#loader_block').css("display", "block");

    fetch(BULLETIN_URL, {
        method: 'GET',
    }).then(function(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }).then(function(data) {
        bulletinList = data;
        AddBuletinList(bulletinList);
        // data 才是實際的 JSON 資料
        $('#loader_block').css("display", "none");
    }).catch(function(error) {
        return error.response;
    }).then(function(errorData) {
        // errorData 裡面才是實際的 JSON 資料
    });
}

function GetSpecificBulletin(bulletinType) {
    let bulletinLink = "";
    const block = '<div id="block" onclick="bulletinDialogBack()"></div>';

    $('body').prepend(block);

    for (let i = 0; i < 9; i += 2) {
        bulletinLink += '<a href="javascript:OpenURL(\'' + bulletinList[bulletinType][i]['url'] + '\')" class="list-group-item list-group-item-light">' +
            bulletinList[bulletinType][i]['title'] + '</a>';
        bulletinLink += '<a href="javascript:OpenURL(\'' + bulletinList[bulletinType][i + 1]['url'] + '\')" class="list-group-item list-group-item-secondary">' +
            bulletinList[bulletinType][i + 1]['title'] + '</a>';
    }

    let bulletinTypeIndex = bulletin.type.indexOf(bulletinType);

    $('<div id="bulletin_dialog" class="card message_container">' +
        '<div class="card-header bulletin_title_icon">' +
        bulletin.paragraph[bulletinTypeIndex] +
        '<span class="' + iconList[bulletinTypeIndex] + ' float-right float-md-right"></span>' +
        '</div>' +
        '<div class="card-body">' +
        '<div class="list-group">' +
        bulletinLink +
        '</div>' +
        '</div>' +
        '</div>').prependTo('#inner_bg');
    bulletinDialogShow();
}
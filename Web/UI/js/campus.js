

const BUILDING_URL = 'http://localhost:3000/api/fcu/building';
const COLLEGE_URL = 'http://localhost:3000/api/fcu/college';
const LANDSCAPE_URL = 'http://localhost:3000/api/fcu/landscape';
var dialogType = '';

function CampusIntroductionCard(Type) {
    $('#loader_block').css("display", "block");
    switch (Type) {
        case 'college':
            GetCampusInfo(COLLEGE_URL);
            dialogType = 'AddDialog(\'college\')';
            break;
        case 'landscape':
            GetCampusInfo(LANDSCAPE_URL);
            dialogType = 'AddDialog(\'landscape\')';
            break;
        case 'building':
            GetCampusInfo(BUILDING_URL);
            dialogType = 'AddDialog(\'building\')';
            break;
    }
}

function AddContainer(campusInfo) {

    postsCarousel = SetPostCarousel();
    section = SetOuterSection();

    $('#outer_bg').prepend(postsCarousel);
    $('#inner_bg').prepend(section);

    AddCard(campusInfo);

    $('.carousel-item').first().addClass('active');
    $('#outer_bg').removeClass('container');   // should be using this in other page too
    $('#outer_bg').addClass('container-fluid');

}

function AddCard(campusInfo) {
    var index = 0; // Index equals to Card amount
    let carouselCount = Math.floor(campusInfo.length / 3);  // Carousel Only Show 3 Cards on every page

    if (campusInfo.length % 3 != 0) {
        carouselCount += 1;
    }

    for (var pageCount = 1; pageCount <= carouselCount; pageCount++) {  // count means how much page

        var carouselId = "carouselId_" + pageCount;
        const carousel_item =
            '<div class="px-5 sub_container_trans carousel-item">'
            + '<div id="' + carouselId + '" class="p-3 row main_container_clear justify-content-center rounded"></div></div>';

        let cardIndex = campusInfo.length - (carouselCount - pageCount) * 3;  //  總Card數 - (總CarouselPage數 - 當下頁數)

        $('#carousel_inner').prepend(carousel_item);
        for (index; index < cardIndex; index++) {
            subContainer = SetSubContainer(campusInfo, index);
            $('#' + carouselId).append(subContainer);
        }
    }
}

function SetOuterSection() {
    const section =
        '<section class="carousel slide" data-ride="carousel" id="postsCarousel">'
        + '<div id="carousel_inner" class="carousel-inner"></div></div>';

    return section;
}

function SetPostCarousel() {
    const postsCarousel =
        '<div class="col-xs-12 text-right lead">'
        + '<a class="btn btn-outline-secondary prev" href="#postsCarousel" data-slide="prev" title="go back">'
        + '<i class="icon-arrow-left"></i>'
        + '</a>'
        + '<a class="btn btn-outline-secondary next" href="#postsCarousel" data-slide="next" title="more">'
        + '<i class="icon-arrow-right"></i>'
        + '</a>'
        + '</div>';

    return postsCarousel;
}

function SetSubContainer(campusInfo, index) {
    const subContainer =
        '<div class="col-md-4 col-lg-3 d-flex align-items-stretch">'
        + '<div class="card sub_container">'
        + '<div class="card-header">'
        + '<h4 class="card-title">' + campusInfo[index]['name'] + '</h4 > '
        + '<h6 class="sub-title text-muted">' + campusInfo[index]['location']['building'] + '</h6 > '
        + '</div>'
        + '<div class="card-body">'
        + '<img class="d-block img-fluid" src="' + campusInfo[index]['info']['image'][0] + '">'
        + '<p class="mt-4 card-text">' + campusInfo[index]['info']['introduction'] + '</p>'
        + '</div>'
        + '<div class="card-footer">'
        + '<div class="d-md-flex d-lg-flex justify-content-between w-100 mt-auto">'
        + '<button class="btn btn-outline-primary button_rwd">開始導覽</button>'
        + '<button id=' + campusInfo[index]['college'] + ' class="btn btn-outline-primary button_rwd" onclick="' + dialogType + '">More..</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    return subContainer;
}

function GetCampusInfo(url) {
    fetch(url, {
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
        campusInfo = data;
        console.log(campusInfo);
        AddContainer(campusInfo);
        $('#loader_block').css("display", "none");
        // data 才是實際的 JSON 資料
    }).catch(function (error) {
        return error.response;
    }).then(function (errorData) {
        // errorData 裡面才是實際的 JSON 資料
    });
}
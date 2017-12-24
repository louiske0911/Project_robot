/**
 * Create Campus Page
 * Campus includes College, Landscape and building Page
 */

let dialogType = '';
let rightCarousel;
let leftCarousel;

/**
 * 
 * @param {*} Type college, landscape, building
 */
function CampusIntroductionCard(Type) {
    switch (Type) {
        case 'college':
            GetCampusInfo(COLLEGE_URL);
            dialogType = 'college';
            break;
        case 'landscape':
            GetCampusInfo(LANDSCAPE_URL);
            dialogType = 'landscape';
            break;
        case 'building':
            GetCampusInfo(BUILDING_URL);
            dialogType = 'building';
            break;
    }
}

/**
 * 
 * @param {*} url One type of Campus API (reference to config.js)
 */
function GetCampusInfo(url) {

    // unblock Web Google map Page, can open map dialog from other page
    mapBlock = 0;

    $('#outer_bg').html("")
    $('#loader_block').css("display", "block");

    fetch(url, {
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
        campusInfo = data;
        console.log(campusInfo);
        AddContainer(campusInfo);
        $('#loader_block').css("display", "none");
        // data 才是實際的 JSON 資料
    }).catch(function(error) {
        return error.response;
    }).then(function(errorData) {
        // errorData 裡面才是實際的 JSON 資料
    });
}

function AddContainer(campusInfo) {
    SetPostCarousel();

    section = SetOuterSection();
    // append inner_bg div for jquery remove and change page
    $('#outer_bg').append('<div id="inner_bg" class="mt-5 row justify-content-center inner_background"></div>')
    $('#inner_bg').prepend(section);

    // Create Card Css for all campus info
    AddCard(campusInfo);
    $('.carousel-item').first().addClass('active');

    /* 
    container-fluid is only for Campus introfuction
    and should be change or remove this in all page
    */
    $('#outer_bg').removeClass('container').addClass('container-fluid');

}

function SetPostCarousel() {
    leftCarousel =
        '<div class="text-right align-self-center">' +
        '<a class="btn prev" style="color:black;" href="#postsCarousel" data-slide="prev" title="go back">' +
        '<i class="fa fa-chevron-circle-left fa-2x"></i>' +
        '</a>' +
        '</div>';
    rightCarousel =
        '<div class="text-left align-self-center">' +
        '<a class="btn next" style="color:black;"href="#postsCarousel" data-slide="next" title="more">' +
        '<i class="fa fa-chevron-circle-right fa-2x"></i>' +
        '</a>' +
        '</div>';
}

function SetOuterSection() {
    const section = '<section class="carousel slide" data-ride="carousel" id="postsCarousel">' +
        '<div id="carousel_inner" class="carousel-inner"></div></div>';
    return section;
}

// Add all cards to container
function AddCard(campusInfo) {
    // Index equals to Card amount
    var index = 0;

    // Carousel Only Show 3 Cards on every page
    let carouselCount = Math.floor(campusInfo.length / 3);

    if (campusInfo.length % 3 != 0)
        carouselCount += 1;

    // count means how much page
    for (var pageCount = 1; pageCount <= carouselCount; pageCount++) {

        let carouselId = "carouselId_" + pageCount;
        const carousel_item =
            '<div class="sub_container_trans carousel-item">' +
            '<div id="' + carouselId + '" class="py-3 row main_container_clear justify-content-center rounded"></div></div>';

        //  總Card數 - (總CarouselPage數 - 當下頁數)
        let cardIndex = campusInfo.length - (carouselCount - pageCount) * 3;

        $('#carousel_inner').prepend(carousel_item);

        $('#' + carouselId).append(leftCarousel);

        for (index; index < cardIndex; index++) {
            let info_index = campusInfo.length - index - 1
            subContainer = SetSubContainer(campusInfo, info_index);
            $('#' + carouselId).append(subContainer);
        }
        $('#' + carouselId).append(rightCarousel);

    }
}

// Set every card info to subcontainer
function SetSubContainer(campusInfo, index) {
    if (campusInfo[index]['location']['building'] == undefined)
        campusInfo[index]['location']['building'] = ""

    const subContainer =
        '<div class="col-md-3 col-lg-3 d-flex align-items-stretch">' +
        '<div class="card sub_container">' +
        '<div class="card-header">' +
        '<h4 class="card-title">' + campusInfo[index]['name'] + '</h4 > ' +
        '<h6 class="sub-title text-muted">' + campusInfo[index]['location']['building'] + '</h6 > ' +
        '</div>' +
        '<div class="card-body">' +
        '<img class="d-block img-fluid" src="' + campusInfo[index]['info']['image'][1] + '">' +
        '<p class="mt-4 card-text">&emsp;&emsp;' + campusInfo[index]['info']['introduction'] + '</p>' +
        '</div>' +
        '<div class="card-footer">' +
        '<div class="d-md-flex d-lg-flex justify-content-between w-100 mt-auto">' +
        '<button' +
        ' data-type=' + dialogType +
        ' data-id=' + campusInfo[index]['id'] +
        ' data-loc=' + campusInfo[index]['location']['location'] + ' class="btn btn-outline-secondary button_rwd"' +
        'onclick="javascript:AndroidPlanPath(this)">開始導覽</button>' +
        '<button data-id=' + campusInfo[index]['id'] + ' class="btn btn-outline-secondary button_rwd"' +
        'onclick="GetSpecifyInfoById(this,\'' + dialogType + '\')">More..</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    return subContainer;
}

function GetSpecifyInfoById(dialogType) {
    AddDialog(dialogType);
}
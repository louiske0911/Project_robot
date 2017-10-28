
setTimeout(function () {
    $("#loader_block").css("display", "none");
}, 1000);

var dialogType = '';

function AddSub(x) {
    if (x == 'landscape') {
        dialogType = 'landscapeShow()';
    } else if (x == 'college') {
        dialogType = 'collegeShow()';
    }
    AddContainer();
    if (x == 'landscape') {
        AddLandscapeDialog();
    } else if (x == 'college') {
        AddCollegeDialog();
    }
}

function AddContainer() {
    const outline_secondary = '<div class="col-xs-12 text-right lead">'
        + '<a class="btn btn-outline-secondary prev" href="#postsCarousel" data-slide="prev" title="go back">'
        + '<i class="icon-arrow-left"></i>'
        + '</a>'
        + '<a class="btn btn-outline-secondary next" href="#postsCarousel" data-slide="next" title="more">'
        + '<i class="icon-arrow-right"></i>'
        + '</a>'
        + '</div>';
    $('#outer_bg').prepend(outline_secondary);
    const section = '<section class="carousel slide" data-ride="carousel" id="postsCarousel">'
        + '<div id="carousel_inner" class="carousel-inner"></div></div>';
    const carousel_item = '<div id="carousel_item" class="px-5 sub_container_trans carousel-item">'
        + '<div id="main_container_clear" class="p-3 row main_container_clear justify-content-center rounded"></div></div>';
    const carousel_item_1 = '<div class="px-5 sub_container_trans carousel-item">'
        + '<div id="main_container_clear_1" class="p-3 row main_container_clear justify-content-center rounded"></div></div>';
    const sub_container = '<div class="col-md-4 col-lg-3 d-flex align-items-stretch">'
        + '<div class="card sub_container">'
        + '<div class="card-header">'
        + '<h4 class="card-title"></h4>'
        + '<h6 class="sub-title text-muted"></h6>'
        + '</div>'
        + '<div class="card-body">'
        + '<img class="d-block img-fluid" src="images/ShangShiue.jpeg">'
        + '<p class="mt-4 card-text">'
        + '</p>'
        + '</div>'
        + '<div class="card-footer">'
        + '<div class="d-md-flex d-lg-flex justify-content-between w-100 mt-auto">'
        + '<button class="btn btn-outline-primary button_rwd">開始導覽</button>'
        + '<button class="btn btn-outline-primary button_rwd" onclick="'
        + dialogType
        + '">More..</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    const titleArray = ['商學院', '建設學院', '建設學院'];
    const titleArray_1 = ['商學院', '建設學院', '工學院'];
    const subTitleArray = ['商學大樓', '丘逢甲紀念館', '丘逢甲紀念館'];
    const subTitleArray_1 = ['商學大樓', '丘逢甲紀念館', '工學館'];
    const imageArray = ['images/ShangShiue.jpeg', 'images/丘逢甲紀念館_01.jpg', 'images/丘逢甲紀念館_01.jpg'];
    const imageArray_1 = ['images/ShangShiue.jpeg', 'images/丘逢甲紀念館_01.jpg', 'images/工學院_01.jpg'];
    const textArray = ['本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。',
        '建設學院成立於2000年8月1日，是台灣唯一以建設為名的學院，致力於培養具備務實專精與創新研發能力，並負有社會責任感與國際觀的國土建設與永續環境發 展專業人才。其中的土木、水利工程學系為1961年逢甲工商學院創校四系之二...',
        ' 建設學院成立於2000年8月1日，是台灣唯一以建設為名的學院，致力於培養具備務實專精與創新研發能力，並負有社會責任感與國際觀的國土建設與永續環境發 展專業人才。其中的土木、水利工程學系為1961年逢甲工商學院創校四系之二...'];
    const textArray_1 = ['本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。 為達成上述使命，本院致力於： 持續提升教師專業知識、教學能力與學生學習成效...'
        + '展專業人才。其中的土木、水利工程學系為1961年逢甲工商學院創校四系之二...',
        ' 建設學院成立於2000年8月1日，是台灣唯一以建設為名的學院，致力於培養具備務實專精與創新研發能力，並負有社會責任感與國際觀的國土建設與永續環境發 展專業人才。其中的土木、水利工程學系為1961年逢甲工商學院創校四系之二...',
        ' 新世紀高等教育已被賦予更多、更重的責任，社會大眾除了希望大學能夠給予年輕學子擁有多元化的技能、教養與更加深思熟慮之外，還期待大學帶動地方經濟發展，提供回流或社區教育，甚至增強國際競爭力 展專業人才。其中的土木、水利工程學系為1961年逢甲工商學院創校四系之二...'];

    $('#inner_bg').prepend(section);
    $('#carousel_inner').prepend(carousel_item);

    for (let i = 0; i < (imageArray.length); i++) {
        $('<div class="col-md-4 col-lg-3 d-flex align-items-stretch">'
            + '<div class="card sub_container">'
            + '<div class="card-header">'
            + '<h4 class="card-title">'
            + titleArray[i]
            + '</h4 > '
            + '<h6 class="sub-title text-muted">'
            + subTitleArray[i]
            + '</h6 > '
            + '</div>'
            + '<div class="card-body">'
            + '<img class="d-block img-fluid" src="'
            + imageArray[i]
            + '">'
            + '<p class="mt-4 card-text">'
            + textArray[i]
            + '</p>'
            + '</div>'
            + '<div class="card-footer">'
            + '<div class="d-md-flex d-lg-flex justify-content-between w-100 mt-auto">'
            + '<button class="btn btn-outline-primary button_rwd">開始導覽</button>'
            + '<button class="btn btn-outline-primary button_rwd" onclick="'
            + dialogType
            + '">More..</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>').prependTo('#main_container_clear');
    }

    $('#carousel_inner').append(carousel_item_1);

    for (let i = 0; i < (imageArray_1.length); i++) {
        $('<div class="col-md-4 col-lg-3 d-flex align-items-stretch">'
            + '<div class="card sub_container">'
            + '<div class="card-header">'
            + '<h4 class="card-title">'
            + titleArray_1[i]
            + '</h4 > '
            + '<h6 class="sub-title text-muted">'
            + subTitleArray_1[i]
            + '</h6 > '
            + '</div>'
            + '<div class="card-body">'
            + '<img class="d-block img-fluid" src="'
            + imageArray_1[i]
            + '">'
            + '<p class="mt-4 card-text">'
            + textArray_1[i]
            + '</p>'
            + '</div>'
            + '<div class="card-footer">'
            + '<div class="d-md-flex d-lg-flex justify-content-between w-100 mt-auto">'
            + '<button class="btn btn-outline-primary button_rwd">開始導覽</button>'
            + '<button class="btn btn-outline-primary button_rwd" onclick="'
            + dialogType
            + '">More..</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>').prependTo('#main_container_clear_1');
    }

    $('#carousel_item').first().addClass('active');
    $('#outer_bg').removeClass('container');
    $('#outer_bg').addClass('container-fluid');

}
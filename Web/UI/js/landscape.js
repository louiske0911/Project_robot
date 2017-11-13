function landscapeShow() {
    document.getElementById("block").style.visibility = "visible";
    document.getElementById("landscape_dialog").style.visibility = "visible";
}

function landscapeBack() {
    document.getElementById("block").style.visibility = "hidden";
    document.getElementById("landscape_dialog").style.visibility = "hidden";
}

function AddLandscapeDialog() {
    const block = '<div id="block" onclick="landscapeBack()"></div>';
    const landscape_dialog = '<div id="landscape_dialog" class="p-4 rounded">' +
        '<div id="dialog_inner" class="dialog_inner"></div></div>';
    const content = '<div class="p-4">' +
        '<h2 class="mb-4" style="text-align:center;">學思園</h2>' +
        '<p class="p-2">' +
        '民國71年初，本校建學思園，藉以重現江南傳統園林藝術之美。民國97年學思園改建，以同質與異質、創新與傳承之概念，將現有學思園營造成人文、生態等意涵記憶之所。</p>' +
        '<p class="p-2">' +
        '學思樓於第47屆校慶竣工，為地下一層、地上九層之建築物，象徵著學校另一個新生命的誕生，新思維、新科技的學思樓與古色古香的學思園相互輝映。</p>' +
        '</div>';

    const dialog_carousel = '<div class="carousel slide" id="carouselExampleControls" data-ride="carousel">' +
        '<div id="dialog_carousel_inner" class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">' +
        '<ul class="carousel-indicators"></ul>' +
        '<a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">' +
        '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
        '<span class="sr-only">Previous</span>' +
        '</a>' +
        '<a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">' +
        '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
        '<span class="sr-only">Next</span>' +
        '</a></div></div>';

    const dialogImgArray = ['images/JungChin.jpg', 'images/ShiueSz.jpg', 'images/ShangShiue.jpeg'];

    $('body').prepend(block);
    $('body').append(landscape_dialog);
    $('#dialog_inner').prepend(content);
    $('#dialog_inner').append(dialog_carousel);

    for (let i = 0; i < (dialogImgArray.length); i++) {
        $('<div class="carousel-item item_container">' +
            '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center"> <img class="d-block img-fluid carousel_img" src=" ' +
            dialogImgArray[i] +
            '"></div></div>').prependTo('#dialog_carousel_inner');
        $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
    }

    $('.carousel-item.item_container').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carousel').carousel();
}
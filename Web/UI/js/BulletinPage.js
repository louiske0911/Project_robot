setTimeout(function () {
    $("#loader_block").css("display", "none");
}, 3000);
// function AddClass() {
//     var newDiv = document.createElement("div");
//     newDiv.classList.add("ctr_1");
//     newDiv.innerHTML += "1234";
//     x = document.getElementById("inner_bg");
//     x.appendChild(newDiv);
//     x.innerHTML += x;

//     // var menu = document.getElementsByTagName("body")[0];
//     // menu.appendChild(newDiv);
//     // var newDiv1 = document.createElement("div");
//     // var x = document.querySelector('body');
// }
function AddCard() {
    /*************************Loader prepend to tag:body*************************/
    $('<div id="loader_block"><div id="loader" class="loader"></div></div>').prependTo('body');
    setTimeout(function () {
        var col = '<div class="col-10 rounded"></div>';
        $('#inner_bg').prepend(col);
        var row = '<div id="row" class="row"></div>';
        $('#inner_bg').append(row);
        var iconArray = ['icon-newspaper', 'icon-bullhorn', 'icon-accessibility', 'icon-user-tie'];
        var cardArray = ['<p class="card-title">建築專業學院參展白晝之夜　學生作品登上國際舞臺</p>'
            + '<p class="card-title">產官學攜手:合辦大數據工作坊育才</p>'
            + '<p class="card-title">威剛技轉逢甲大學　發展智慧照明點亮校園</p>',
        '<p class="card-title">APPS校務資訊應用服務網停止服務通知</p>'
        + '<p class="card-title">10月21日「SPSS 商業數據分析師認證課程」報名通知</p>'
        + '<p class="card-title">「運用 SAS TM 駕馭文字探勘」系列線上免費課程通知</p>',
        '<p class="card-title">106學年度學期專題製作課程「社區支持型農業之在地實踐」校外教學</p>'
        + '<p class="card-title">106學年度學期微學分課程「自造藺我:藺編與社區再造實作工作坊」校外教學</p>'
        + '<p class="card-title">10月13日「MATLAB 2017新版本介紹以及於機器學習與深度學習應用概述」演講活動</p>',
        '<p class="card-title">應數系專題演講</p>'
        + ' <p class="card-title">財算學程1061124專題演講：</p>'
        + '<p class="card-title">公創所專題演講：浪費食物學</p>'];
        var paragraphArray = ['校園新聞', '校園公告', '校園活動', '校園演講'];
        var imgArray = ["images/MainPage_01.jpg", "images/MainPage_02.jpg", "images/MainPage_03.jpg"];
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
        /*************************Insert the content of carousel_inner*************************/
        $('#inner_bg').prepend(carousel_inner);
        /*************************Insert the carousel item*************************/
        for (var i = 0; i < (imgArray.length); i++) {
            $('<div class="carousel-item item_container">'
                + '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center"> <img class="d-block img-fluid carousel_img" src=" '
                + imgArray[i]
                + '"></div></div>').prependTo('#carousel_item');
            $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
        }


        $('.carousel-item.item_container').first().addClass('active');
        $('.carousel-indicators > li').first().addClass('active');
        $('#carousel').carousel();
        /*************************Insert the card*************************/

        for (var i = 0; i < (iconArray.length); i++) {
            $('<div class="col-md-12 col-xl-6 mb-4">'
                + '<div class="card h-100 mb-3 message_container">'
                + ' <div id="card_header" class="card-header d-flex justify-content-between">'
                + paragraphArray[i]
                + '<a class="message_icon" href="#">'
                + '<span id="icon" class="">' + iconArray[i] + '</span>'
                + '</a>'
                + '</div>'
                + '<div id="card_body" class="card-body">'
                + cardArray[i]
                + '</div>'
                + '<div class="card-footer d-flex  justify-content-end ftr">'
                + '<a>..More</a>'
                + '</div>'
                + '</div>'
                + '</div>').appendTo('#row');
        }
    }, 2000);
}
// function AddCarousel() {
//     var imgArray = ["images/MainPage_01.jpg", "images/MainPage_02.jpg", "images/MainPage_03.jpg"];
//     var carousel_inner = '<div class="carousel slide" id="carouselExampleControls_mainpage" data-ride="carousel">'
//         + '<div id="carousel_item" class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">'
//         + '<ul class="carousel-indicators"></ul>'
//         + '<a class="carousel-control-prev" href="#carouselExampleControls_mainpage" role="button" data-slide="prev">'
//         + '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'
//         + '<span class="sr-only">Previous</span>'
//         + '</a>'
//         + '<a class="carousel-control-next" href="#carouselExampleControls_mainpage" role="button" data-slide="next">'
//         + '<span class="carousel-control-next-icon" aria-hidden="true"></span>'
//         + '<span class="sr-only">Next</span>'
//         + '</a></div></div>';
//     $('#inner_bg').prepend(carousel_inner);

//     /*************************Isert the carousel item*************************/
//     for (var i = 0; i < (imgArray.length); i++) {
//         $('<div class="carousel-item item_container">'
//             + '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center"> <img class="d-block img-fluid carousel_img" src=" '
//             + imgArray[i]
//             + '"></div></div>').prependTo('#carousel_item');
//         $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
//     }


//     $('.carousel-item.item_container').first().addClass('active');
//     $('.carousel-indicators > li').first().addClass('active');
//     $('#carousel').carousel();
// }
/* <div class="mb-4 carousel slide" id="carouselExampleControls_mainpage" data-ride="carousel">
    <div class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">

        <div class="carousel-item active item_container">
            <div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center">
                <img class="d-block img-fluid carousel_img" src="images/MainPage_01.jpg">
                            </div>
            </div>
    
            <div class="carousel-item item_container">
                <div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center">
                    <img class="d-block img-fluid carousel_img" src="images/MainPage_02.jpg">
                            </div>
                </div>
    
                <div class="carousel-item item_container">
                    <div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center">
                        <img class="d-block img-fluid carousel_img" src="images/MainPage_03.jpg">
                            </div>
                    </div>
    
                    <ul class="carousel-indicators">
                        <li class="active" data-target="#photoCarousel" data-slide-to="0"></li>
                        <li class="" data-target="#photoCarousel" data-slide-to="1"></li>
                        <li class="" data-target="#photoCarousel" data-slide-to="2"></li>
                    </ul>
                    <a class="carousel-control-prev" href="#carouselExampleControls_mainpage" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExampleControls_mainpage" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
            </div> */
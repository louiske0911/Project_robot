function NavigationShow() {
    document.getElementById("block").style.visibility = "visible";
    document.getElementById("navigation_dialog").style.visibility = "visible";
}

function NavigationBack() {
    document.getElementById("block").style.visibility = "hidden";
    document.getElementById("navigation_dialog").style.visibility = "hidden";
}

function InitMap() {
    var FengChia = {
        lat: 24.1801304,
        lng: 120.6484
    };
    var FengChia2 = {
        lat: 24.18201304,
        lng: 120.62484
    };
    var mapOptions = {
        center: FengChia,
        zoom: 17
    };



    let contentString =
        '<div>' +
        '<div class="carousel slide" id="carouselExampleControls_mainpage" data-ride="carousel">' +
        '<div id="carousel_item" class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">' +
        '<div class="carousel-item active item_container_nav h-50" style="border:red 2px solid">' +
        '<div class="d-md-flex d-sm-flex d-lg-flex align-items-center justify-content-center">' +
        '<img class="d-block img-fluid test" src="../images/JungChin.jpg">' +
        '</div>' +
        '</div>' +
        '<div class="carousel-item item_container_nav h-50" style="border:blue 2px solid">' +
        '<div class="d-md-flex d-sm-flex d-lg-flex align-items-center justify-content-center">' +
        '<img class="d-block img-fluid test" src="../images/ShiueSzYuan.jpg">' +
        '</div>' +
        '</div>' +
        '<div class="carousel-item item_container_nav h-50" style="border:green 2px solid">' +
        '<div class="d-md-flex d-sm-flex d-lg-flex align-items-center justify-content-center">' +
        '<img class="d-block img-fluid test" src="../images/ShangShiue.jpeg">' +
        '</div>' +
        '</div>' +
        '<a class="carousel-control-prev" href="#carouselExampleControls_mainpage" role="button" data-slide="prev">' +
        '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
        '<span class="sr-only">Previous</span>' +
        '</a>' +
        '<a class="carousel-control-next" href="#carouselExampleControls_mainpage" role="button" data-slide="next">' +
        '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
        '<span class="sr-only">Next</span>' +
        '</a></div></div>';
    // + '<p>本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。</p>'
    // + '<p>為達成上述使命，本院致力於：</p>'
    // + '<ol>'
    // + '<li>持續提升教師專業知識、教學能力與學生學習成效。</li>'
    // + '<li>鼓勵教師參與提升學校、企業及國家競爭力之相關服務與研究。</li>'
    // + '<li>培育學生具備人文素養、專業知識與社會責任，以成為國際企業所需之專業人才。</li>'
    // + '</ol>'
    // + '<p>本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。</p></div>';

    var map = new google.maps.Map(
        document.getElementById('inner_bg'), mapOptions);

    google.maps.event.addDomListener(window, 'load', InitMap);

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    /*****Add Marker*****/
    for (var i = 0; i < data['data'].length; i++) {
        var lat1 = parseFloat(data['data'][i]['Lat'])
        var lng1 = parseFloat(data['data'][i]['Lng'])
        var magn = parseFloat(data['data'][i]['magnitude'])
        var color
        if (magn > 55) {
            color = 'red'

        }
        var marker = new google.maps.Marker({
            position: {
                lat: lat1,
                lng: lng1
            },
            map: map,
            title: 'Uluru (Ayers Rock)',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.8,
                scale: 1,
                strokeColor: color,
                strokeWeight: 5
            },
            draggable: true,

        });
    }
    console.log(i)

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });
}

function GetNavigation() {
    let main_container_googlemap = '<div id="main_container_googlemap" class="mt-5 row main_container_clear"></div>';

    let col =
        '<div class="col-md-1"></div>' +
        '<div id="map-canvas" class="my-5 col-md-12 rounded"></div>' +
        '<div id="col_md_6" class="p-5 col-md-6 d-md-flex d-xl-flex justify-content-center align-content-start flex-wrap"></div>';
    let row =
        '<div class="row" style="border:red 2px solid">' +
        '<div class="container">' +
        '<span class=""></span>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="p-4 arrow_box">' +
        '<p>本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。</p>' +
        '<p>為達成上述使命，本院致力於：</p>' +
        '<ol>' +
        '<li>持續提升教師專業知識、教學能力與學生學習成效。</li>' +
        '<li>鼓勵教師參與提升學校、企業及國家競爭力之相關服務與研究。</li>' +
        '<li>培育學生具備人文素養、專業知識與社會責任，以成為國際企業所需之專業人才。</li>' +
        '</ol>' +
        '<p>本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。</p>' +
        '</div>' +
        '</div>';

    $('#inner_bg').prepend(main_container_googlemap);
    $('#main_container_googlemap').prepend(col);
    $('#col_md_6').prepend(row);
}

function GetGoogleMap() {
    // GetNavigation();
    InitMap();
}
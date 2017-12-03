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

    var mapOptions = {
        center: FengChia,
        zoom: 18,
        mapTypeControlOptions: {
            mapTypeIds: ['satellite', 'styled_map']
        },
        scrollwheel: false,
        disableDoubleClickZoom: true,
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

    var styledMapType = new google.maps.StyledMapType(
        [
            {
                "featureType": "poi.business",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ]);

    var map = new google.maps.Map(
        document.getElementById('outer_bg'), mapOptions);

    google.maps.event.addDomListener(window, 'load', InitMap);

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

    var marker = new google.maps.Marker({
        position: FengChia,
        map: map,
        icon: {
            url: 'images/placeholder.png',
        },
        title: 'Uluru (Ayers Rock)',
        // draggable: true,

    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });
}

function GetNavigation() {
    $('#outer_bg').html("");
    $('#outer_bg').append('<div id="inner_bg" class="mt-5 row justify-content-center inner_background"></div>')
    $('#outer_bg').removeClass('container').addClass('container-fluid');
}

function GetGoogleMap() {
    GetNavigation();
    InitMap();
}


function SendNavigation(data) {
    let navigationContent = data.info.history;
    let navigationImage = data.ingo.image;
    console.log('123')
    console.log(navigationContent);
    console.log(navigationImage);
}


function TpyeWriter(text) {
    var textToDisplay = text;
    $output = $("#456");

    $("#123").click(function () {
        var displayInt;
        textToDisplay = textToDisplay.split('');
        $output.empty();
        displayInt = setInterval(function () {
            var word = textToDisplay.shift();
            if (word == null) {
                return clearInterval(displayInt);
            }
            $output.append(word);
        }, 50);
    });
}
var markerList = [];
var mapNavigationEvent = 0;
var map;
var infowindow;
let navigationImage = []
let navigationContent
let mapContent

function NavigationShow() {
    document.getElementById("block").style.visibility = "visible";
    document.getElementById("navigation_dialog").style.visibility = "visible";
}

function NavigationBack() {
    document.getElementById("block").style.visibility = "hidden";
    document.getElementById("navigation_dialog").style.visibility = "hidden";
}

function InitMap() {
    markerList = [];
    var FengChia = {
        lat: 24.1801304,
        lng: 120.6484
    };

    var mapOptions = {
        center: FengChia,
        zoom: 18,
        mapTypeControlOptions: {
            mapTypeIds: ['satellite', 'styled_map', google.maps.MapTypeId.ROADMAP]
        },
        scrollwheel: false,
        disableDoubleClickZoom: true,
    };

    var styledMapType = new google.maps.StyledMapType(
        [{
                "featureType": "poi.business",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text",
                "stylers": [{
                    "visibility": "off"
                }]
            }
        ]);

    map = new google.maps.Map(
        document.getElementById('outer_bg'), mapOptions);

    map.mapTypes.set('styled_map', styledMapType)
    map.setMapTypeId('styled_map')

    var marker, i;

    // A new Info Window is created and set content
    infowindow = new google.maps.InfoWindow({
        maxWidth: 350
    });

    var pos
    var userMarker
    var im = 'http://www.robotwoods.com/dev/misc/bluecircle.png';
    userMarker = new google.maps.Marker({
        map: map,
        icon: im
    });


    console.log(mapBlock)
        // getLocationInterval = setInterval(function() {
        //     if (navigator.geolocation && (mapBlock == 1)) {

    //         navigator.geolocation.getCurrentPosition(function(position) {
    //             pos = {
    //                 lat: position.coords.latitude,
    //                 lng: position.coords.longitude
    //             };
    //             console.log(pos)
    //             userMarker.setPosition(pos)
    //                 // map.setCenter(pos);
    //         }, function() {
    //             handleLocationError(true, infowindow, map.getCenter());
    //         });
    //     } else {
    //         // Browser doesn't support Geolocation
    //         handleLocationError(false, infowindow, map.getCenter());
    //         clearInterval(getLocationInterval);
    //     }
    // }, 1500);

    for (let i = 0; i < markers.length; i++) {
        let location = markers[i].location.split(',')

        var position = new google.maps.LatLng(location[0], location[1]);

        marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: {
                url: 'images/placeholder.png',
            },
            title: markers[i].name
        });

        // Allow each marker to have an info window    
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                // InfoWindow content
                mapContent =
                    '<div id="iw-container">' +
                    '<div class="iw-title">' +
                    '<img style="display:block;margin:0px;border:0px;width:100%;height:100%" src="' + markers[i].image + '" height="115" width="83">' +
                    '</div>';

                infowindow.setContent(mapContent);
                infowindow.open(map, marker);
            }
        })(marker, i));
        markerList.push(marker)
    }

    google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

    CreateInfoWindows();
}

function GetNavigation() {
    $('#outer_bg').html("");
    $('#outer_bg').removeClass('container').addClass('container-fluid');
}

function GetGoogleMap() {
    mapBlock = 1;
    GetNavigation();
    InitMap();
    google.maps.event.addDomListener(infowindow, 'load', InitMap);
}

function SendNavigationToGoogleMap(data, mapId) {
    CloseMap();

    navigationContent = ""
    navigationImage = data.info.image

    if (data.info.history)
        navigationContent = data.info.history;
    else
        navigationContent = data.info.introduction;

    navigationContent = navigationContent.split('\n')[0].replace(' ', '').replace('\n', ',').replace('。', ',').replace('、', ',')
    mapNavigationEvent = 1;

    markerList.forEach(element => {
        element.setVisible(false)
    });
    // google.maps.event.trigger(markerList[4], 'click');
    setTimeout(function() {
        let infowindowHTML =
            '<div id="iw-container">' +
            '<div class="iw-title">' +
            '<img style="display:block;margin:0px;border:0px;width:100%;height:100%" src="' + data.info.image[2] + '" height="115" width="83">' +
            '</div>' +
            '<div class="iw-content">' +
            '<div class="iw-subTitle">' + data.name + '</div>' +
            '<p id="mapDialogContent">' + navigationContent + '</p>' +
            '</div>';

        infowindow.setContent(infowindowHTML);
        console.log(markerList[mapId]);
        markerList[mapId].setVisible(true)
        infowindow.open(map, markerList[mapId]);
        TpyeWriter(navigationContent)
    }, 500);
}
let textToDisplay = ""

function TpyeWriter(text) {

    textToDisplay = ""
    textToDisplay = text

    console.log(textToDisplay)
    $output = $("#mapDialogContent");
    var displayInt;
    textToDisplay = textToDisplay.split('');
    $output.empty();
    displayInt = setInterval(function() {
        var word = textToDisplay.shift();
        if (word == null) {
            return clearInterval(displayInt);
        }
        $output.append(word);
    }, 190);
    // mapNavigationEvent = 0;
}


function CreateInfoWindows() {
    // *
    // START INFOWINDOW CUSTOMIZE.
    // The google.maps.event.addListener() event expects
    // the creation of the infowindow HTML structure 'domready'
    // and before the opening of the infowindow, defined styles are applied.
    // *
    google.maps.event.addListener(infowindow, 'domready', function() {

        // Reference to the DIV that wraps the bottom of infowindow
        var iwOuter = $('.gm-style-iw');

        /* Since this div is in a position prior to .gm-div style-iw.
         * We use jQuery and create a iwBackground variable,
         * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
         */
        var iwBackground = iwOuter.prev();

        // Removes background shadow DIV
        iwBackground.children(':nth-child(2)').css({ 'display': 'none' });

        // Removes white background DIV
        iwBackground.children(':nth-child(4)').css({ 'display': 'none' });

        // Moves the infowindow 115px to the right.
        iwOuter.parent().parent().css({ left: '115px' });

        // Moves the shadow of the arrow 76px to the left margin.
        iwBackground.children(':nth-child(1)').attr('style', function(i, s) { return s + 'left: 76px !important;' });

        // Moves the arrow 76px to the left margin.
        iwBackground.children(':nth-child(3)').attr('style', function(i, s) { return s + 'left: 76px !important;' });

        // Changes the desired tail shadow color.
        iwBackground.children(':nth-child(3)').find('div').children().css({ 'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index': '1' });

        // Reference to the div that groups the close button elements.
        var iwCloseBtn = iwOuter.next();

        // Apply the desired effect to the close button
        iwCloseBtn.css({ opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9' });

        // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
        if ($('.iw-content').height() < 140) {
            $('.iw-bottom-gradient').css({ display: 'none' });
        }

        // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
        iwCloseBtn.mouseout(function() {
            $(this).css({ opacity: '0.5' });
        });
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infowindow.setPosition(pos);
    infowindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}
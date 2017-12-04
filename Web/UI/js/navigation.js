var markerList = [];
var mapNavigationEvent = 0;
var map;
var infowindow;
let navigationImage = []
let navigationContent

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
            mapTypeIds: ['satellite', 'styled_map']
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

    var marker, i
    infowindow = new google.maps.InfoWindow()

    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');


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
        var infowindow2 = new google.maps.InfoWindow();
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent('<p id="789">test</p>');
                infowindow.open(map, marker);
                // google.maps.event.addListener(infowindow, 'domready', function() {
                // });
            }
        })(marker, i));
        markerList.push(marker)
        console.log(i)
    }

    google.maps.event.addDomListener(infowindow, 'load', InitMap);

    google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

}

function GetNavigation() {
    $('#outer_bg').html("");
    $('#outer_bg').removeClass('container').addClass('container-fluid');
}

function GetGoogleMap() {
    GetNavigation();
    InitMap();

}

function SendNavigationToGoogleMap(data) {
    navigationContent = ""
    navigationImage = data.info.image

    if (data.info.history)
        navigationContent = data.info.history;
    else
        navigationContent = data.info.introduction;

    navigationContent = navigationContent.split('。')[0].replace(' ', '').replace('\n', ',').replace('。', ',').replace('、', ',')
    mapNavigationEvent = 1;


    // google.maps.event.trigger(markerList[4], 'click');
    setTimeout(function() {
        infowindow.setContent('<p id="123"></p>');

        console.log(markerList[1]);
        infowindow.open(map, markerList[1]);
        TpyeWriter(navigationContent)
    }, 1000);


}


function TpyeWriter(text) {
    let textToDisplay = ""
    textToDisplay = text
    console.log(textToDisplay)
    $output = $("#123");
    var displayInt;
    textToDisplay = textToDisplay.split('');
    $output.empty();
    displayInt = setInterval(function() {
        var word = textToDisplay.shift();
        if (word == null) {
            return clearInterval(displayInt);
        }
        $output.append(word);
    }, 100);
    // mapNavigationEvent = 0;
}
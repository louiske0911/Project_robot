function IntoSystem(page) {
    $('#loader_block').css("display", "block");
    let hash, url
    switch (page) {
        case 'college':
            hash = "#college";
            break;
        case 'building':
            hash = "#building";
            break;
        case 'landscape':
            hash = "#landscape";
            break;
        case 'location':
            hash = "#location";
            break;
        case 'bulletin':
            hash = "#bulletin";
            break;
        case 'login':
            hash = "#login";
    }

    url = LEAD_GO_URL + hash
    window.location.assign(url);

}
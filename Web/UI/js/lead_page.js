const BUILDING_URL = 'http://localhost:3000/api/fcu/building';
const COLLEGE_URL = 'http://localhost:3000/api/fcu/college';
const LANDSCAPE_URL = 'http://localhost:3000/api/fcu/landscape';
var dialogType = '';

function IntoSystem(page) {
    $('#loader_block').css("display", "block");
    switch (page) {
        case 'college':
            GetCampusInfo(COLLEGE_URL);
            dialogType = 'AddDialog(\'college\')';
            break;
        case 'building':
            GetCampusInfo(BUILDING_URL);
            dialogType = 'AddDialog(\'building\')';
            break;
        case 'landscape':
            GetCampusInfo(LANDSCAPE_URL);
            dialogType = 'AddDialog(\'landscape\')';
            break;
        case 'location':

            break;
        case 'bulletin':

            break;

    }
}
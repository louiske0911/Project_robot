var GOOGLE_STATUS = 0;
let speckContent = "";
let mapBlock = 0;

function AndroidPlanPath(info) {
    let lat, lng;
    let location = info.dataset.loc
    location = location.split(',')

    lat = location[0];
    lng = location[1];
    console.log(lat)
    console.log(lng)
    try {
        if (JSInterface) {
            JSInterface.setDirection(lat, lng);
            Navigation(info.dataset.type, info.dataset.id);
        }
    } catch (e) {
        if (e instanceof ReferenceError) {
            console.log("Plan Path: " + info.dataset.type + info.dataset.id)
            Navigation(info.dataset.type, info.dataset.id);
        } else {
            printError(e, false);
        }
    }
}

function OpenURL(url) {
    try {
        if (JSInterface) {
            JSInterface.sendWebviewURL(url);
        }
    } catch (e) {
        if (e instanceof ReferenceError) {
            var win = window.open(url, '_blank');
            win.focus();
        } else {
            printError(e, false);
        }
    }
}

function GoogleMap() {
    try {
        if (JSInterface) {
            if (GOOGLE_STATUS == 0) {
                JSInterface.showToast();
                GOOGLE_STATUS = 1;
            }
        }
    } catch (e) {
        if (e instanceof ReferenceError) {
            alert("此功能目前只開放現場使用者唷！！")
        } else {
            printError(e, false);
        }
    }
}

function CloseMap() {
    GOOGLE_STATUS = 0;
}

function GetHistoryAndSetInfo(URL, id, mapId) {
    URL = URL + id
    fetch(URL, {
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
        SetNavigation(data, mapId)
            // data 才是實際的 JSON 資料
    }).catch(function(error) {
        return error.response;
    }).then(function(errorData) {
        // errorData 裡面才是實際的 JSON 資料
    });
}

function Navigation(type, id) { //Android Webview need call this function to speech
    let mapId = id - 1
    let url;
    if (type == 'college') {
        url = COLLEGE_DIALOG_URL;
    } else if (type == 'building') {
        mapId += 12
        url = BUILDING_DIALOG_URL;
    } else if (type == 'landscape') {
        mapId = mapId + 12 + 19
        url = LANDSCAPE_DIALOG_URL;
    }

    console.log(type)
    console.log(id)

    if (mapBlock == 0) {
        GetGoogleMap();
    }
    GetHistoryAndSetInfo(url, id, mapId)

}


function SetNavigation(data, mapId) {
    SendNavigationToGoogleMap(data, mapId)
    SendSpeech(data)
}

function SendSpeech(data) {
    if (data.info.history)
        speakContent = data.info.history;
    else
        speakContent = data.info.introduction;

    speakContent = speakContent.split('。')[0].replace(' ', '').replace('\n', ',').replace('。', ',').replace('、', ',')

    try {
        if (JSInterface) {
            JSInterface.setTTS(speakContent);
        }
    } catch (e) {
        if (e instanceof ReferenceError) {
            Speech(speakContent)
        } else {
            printError(e, false);
        }
    }
}

// function SendtLocation(pos) {
//     try {
//         if (JSInterface) {
//             JSInterface.location(pos);
//         }
//     } catch (e) {
//         if (e instanceof ReferenceError) {
//             console.log(pos)
//         } else {
//             printError(e, false);
//         }
//     }
// }
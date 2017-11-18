const COLLEGE_DIALOG_URL = "http://localhost:3000/api/fcu/college/123";
const LANDSCAPE_DIALOG_URL = "http://localhost:3000/api/fcu/landscape/123";
const BUILDING_DIALOG_URL = "http://localhost:3000/api/fcu/building/123";


function dialogShow() {
    document.getElementById("block").style.visibility = "visible";
    document.getElementById("campus_dialog").style.visibility = "visible";
}

function dialogBack() {
    document.getElementById("block").style.visibility = "hidden";
    document.getElementById("campus_dialog").style.visibility = "hidden";
}

function AddDialog(Type) {
    switch (Type) {
        case 'college':
            GetDialogInfo(COLLEGE_DIALOG_URL, Type);
            break;
        case 'landscape':
            GetDialogInfo(LANDSCAPE_DIALOG_URL, Type);
            break;
        case 'building':
            GetDialogInfo(BUILDING_DIALOG_URL, Type);
            break;
    }
}

function SetDepartment(departmentList) {
    let department = '';

    for (let i = 0; i < departmentList.length; i++) {
        department +=
            '<h4 style="text-align:center;">' +
            departmentList[i]['department_type'] +
            '</h4>'
        for (let y = 0; y < departmentList[i]['department_list'].length; y++) {
            let url = departmentList[i]['department_list'][y]['department_url']
            department +=
                '<li class="px-5 p-2">' +
                '<a href=javascript:OpenURl(' + url + ')>' +
                departmentList[i]['department_list'][y]['department_name'] +
                '</a></li>'
            console.log(departmentList[i])
        }
    }
    return department
}

function SetDialogContent(info, Type) {
    // 先判斷是否有系及 若有才將系及放入content
    var dialogContent = '';
    var content = '';
    const contentTitle =
        '<div class="p-4">' +
        '<h2 class="mb-4" style="text-align:center;">學院介紹</h2>' +
        '</div>';

    for (let i = 0; i < info['introduction'].length; i++) {
        let STRING = info['introduction'][i];
        if (STRING.indexOf('.') > -1) {
            STRING = STRING.substring(2)
            content += '<li class="p-2 px-5">' + STRING + '</li>'
        } else {
            content += '<p class="px-5">' + STRING + '</p>'
        }
    }

    dialogContent += contentTitle + content

    if (Type == 'college') {
        department = SetDepartment(info['department']);
        dialogContent += department;
    }

    return dialogContent;
}

function SetDialogImage(imageList) {
    let dialogImage = [];
    for (let i = 0; i < imageList.length; i++) {
        let image =
            '<div class="carousel-item item_container">' +
            '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center">' +
            '<img class="d-block img-fluid carousel_img" src="' + imageList[i] + '">' +
            '</div></div>'
        dialogImage.push(image)
    }
    return dialogImage;
}

function SetDialogCarousel() {
    const dialogCarousel =
        '<div class="carousel slide" id="carouselExampleControls" data-ride="carousel">' +
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
    return dialogCarousel;
}

function Dialog(dialogInfo, Type) {
    const block = '<div id="block" onclick="dialogBack()"></div>';
    const campus_dialog =
        '<div id="campus_dialog" class="p-4 rounded">' +
        '<div id="dialog_inner" class="dialog_inner"></div></div>';

    dialogContent = SetDialogContent(dialogInfo['info'], Type);
    dialogCarousel = SetDialogCarousel();
    dialogImage = SetDialogImage(dialogInfo['info']['image']);

    $('body').prepend(block);
    $('body').prepend(campus_dialog);
    $('#dialog_inner').prepend(dialogContent);
    $('#dialog_inner').append(dialogCarousel);

    for (let i = 0; i < (dialogImage.length); i++) {
        $(dialogImage[i]).prependTo('#dialog_carousel_inner');
        $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
    }

    $('.carousel-item.item_container').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carousel').carousel();
}

function GetDialogInfo(URL, Type) {
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
        dialogInfo = data;
        console.log(dialogInfo);
        Dialog(dialogInfo, Type);
        dialogShow();
        // data 才是實際的 JSON 資料
    }).catch(function(error) {
        return error.response;
    }).then(function(errorData) {
        // errorData 裡面才是實際的 JSON 資料
    });
}
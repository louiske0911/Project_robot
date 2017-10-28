function collegeShow() {
    document.getElementById("block").style.visibility = "visible";
    document.getElementById("college_dialog").style.visibility = "visible";
}

function collegeBack() {
    document.getElementById("block").style.visibility = "hidden";
    document.getElementById("college_dialog").style.visibility = "hidden";
}

function AddCollegeDialog() {
    const block = '<div id="block" onclick="collegeBack()"></div>';
    const college_dialog = '<div id="college_dialog" class="p-4 rounded">'
        + '<div id="dialog_inner" class="dialog_inner"></div></div>';
    const content = '<div class="p-4">'
        + '<h2 class="mb-4" style="text-align:center;">學院介紹</h2>'
        + '<p class="p-2">'
        + '本院致力於成為亞太知名商管學院，旨在提升卓越教學成效及教師智慧貢獻，以培育國際企業發展所需之商管專業人才，並以培育學生具備商業資料分析的科技能力與國際企業所愛的移動能力為教學發展特色。'
        + '<p class="p-2">為達成上述使命，本院致力於：</p>'
        + '<ol>'
        + '<li>持續提升教師專業知識、教學能力與學生學習成效。 </li>'
        + '<li>鼓勵教師參與提升學校、企業及國家競爭力之相關服務與研究。</li >'
        + '<li>培育學生具備人文素養、專業知識與社會責任，以成為國際企業所需之專業人才。</li>'
        + '</ol>'
        + '此外，為順應國際化潮流，獲得國際學術組織認證是邁向國際化及提升國際競爭力的重要指標之ㄧ。本院為提升教學品質，並與國外著名大學並駕齊驅，於2006年申請加入AACSB成為會員。2007年12月因本校院系組織重整，復以商學院、金融學院之名，重新申請入會，修訂並遞交新的認證資格申請書(eligibility'
        + 'application)，並於2008年1月重新取得第一階段之認證預審資格。本院(含金融學院及EMBA)之AACSB認證計畫書於2009年5月份正式送交AACSB審核，並分別於2009年6月及9月順利通過AACSB'
        + 'PAC(pre-accreditation committee) 及IAC(initial accreditation committee)會議審核通過，正式進入「初始認證」階段。2013年11月進行實地訪評，2014年2月3日AACSB公告本校通過認證，成為台灣第九所、中部第一所獲得AACSB認證的學校。'
        + '</p>'
        + '<p class="p-2">'
        + '「國際商管學院促進協會」(The Association to Advance Collegiate Schools of Business, AACSB)成立於1916年，發起成員包括美國哈佛大學、耶魯大學以及康乃爾大學等，為全球最具指標性的商管學院認證機構，能獲得AACSB國際認證不僅是對商學院教學品質之肯定，亦能提升本校之國際知名度，將逢甲大學推向國際級一流學府的地位。'
        + '</p>'
        + '<h4 style="text-align:center;">'
        + '碩士班'
        + '</h4>'
        + '<ul>'
        + '<li>會計學系</li>'
        + '<li>國際經營與貿易學系</li>'
        + '<li>財稅學系</li>'
        + '<li>合作經濟暨社會經營學系</li>'
        + '<li>統計學系統計與精算碩士班</li>'
        + '<li>經濟學系</li>'
        + '<li>企業管理學系</li>'
        + '<li>財經法律研究所</li>'
        + '<li>科技管理碩士學位學程</li>'
        + '</ul>'
        + '<h4 style="text-align:center;">'
        + '    學士班'
        + '</h4>'
        + '<ul>'
        + '    <li>會計學系</li>'
        + '    <li>國際經營與貿易學系</li>'
        + '    <li>財稅學系</li>'
        + '    <li>合作經濟暨社會經營學系</li>'
        + '    <li>統計學系</li>'
        + '    <li>經濟學系</li>'
        + '    <li>企業管理學系</li>'
        + '    <li>行銷學系</li>'
        + '    <li>國際企業管理學士學位學程(英語專班)</li>'
        + '    <li>商學進修學士班</li>'
        + '</ul>'
        + '</div>'

    const dialog_carousel = '<div class="carousel slide" id="carouselExampleControls" data-ride="carousel">'
        + '<div id="dialog_carousel_inner" class="carousel-inner d-md-flex d-sm-flex d-lg-flex justify-content-center rounded">'
        + '<ul class="carousel-indicators"></ul>'
        + '<a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">'
        + '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'
        + '<span class="sr-only">Previous</span>'
        + '</a>'
        + '<a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">'
        + '<span class="carousel-control-next-icon" aria-hidden="true"></span>'
        + '<span class="sr-only">Next</span>'
        + '</a></div></div>';

    const dialogImgArray = ['images/JungChin.jpg', 'images/ShiueSz.jpg', 'images/ShangShiue.jpeg'];

    $('body').prepend(block);
    $('body').prepend(college_dialog);
    $('#dialog_inner').prepend(content);
    $('#dialog_inner').append(dialog_carousel);

    for (let i = 0; i < (dialogImgArray.length); i++) {
        $('<div class="carousel-item item_container">'
            + '<div class="d-md-flex d-sm-flex d-lg-flex h-100 align-items-center justify-content-center"> <img class="d-block img-fluid carousel_img" src=" '
            + dialogImgArray[i]
            + '"></div></div>').prependTo('#dialog_carousel_inner');
        $('<li class="" data-target="#photoCarousel" data-slide-to="' + i + '"></li>').appendTo('.carousel-indicators');
    }

    $('.carousel-item.item_container').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carousel').carousel();
}
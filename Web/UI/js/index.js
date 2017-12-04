var menulist;

$(document).ready(function () {
    $('div.nav_bar nav button').click(
        function (e) {
            $('div.nav_bar nav button').removeClass('active');
            $(e.currentTarget).addClass('active');
        }
    );
});

$(document).ready(function () {
    let hash = window.location.hash.replace("#", "")
    console.log(hash)

    if (hash === ("college" || "building" || "landscape")) {
        CampusIntroductionCard(hash)
    } else if (hash === "location") {
        GoogleMap();
    } else if (hash === "bulletin") {
        getBulletin();
    } else if (hash === "login") {
        aboutDialogShow();
    }
});

function GoLeadPage() {
    let url = "http://localhost:3000/static/lead_page.html"
    window.location.assign(url);
}


$(document).ready(function () {
    $('#menu').on('click', function () {
        var active = $('.sidebar')
        if (!active.hasClass('active')) {
            $('.sidebar').toggleClass('active')
            $('nav button a').hide()
        } else {
            $('.sidebar').removeClass('active')
            $('nav button a').show()
        }
    });
});


// Backend API list
const LEAD_URL = "http://localhost:3000/static/lead_page.html"
const LEAD_GO_URL = "http://localhost:3000/index.html"

const BULLETIN_URL = 'http://localhost:3000/api/fcu/bulletin';

const BUILDING_URL = 'http://localhost:3000/api/fcu/building';
const BUILDING_DIALOG_URL = "http://localhost:3000/api/fcu/building/";

const COLLEGE_URL = 'http://localhost:3000/api/fcu/college';
const COLLEGE_DIALOG_URL = "http://localhost:3000/api/fcu/college/";

const LANDSCAPE_URL = ' http://localhost:3000/api/fcu/landscape';
const LANDSCAPE_DIALOG_URL = "http://localhost:3000/api/fcu/landscape/";


const markers = [{
    name: "商學院",
    location: "24.178333,120.649845",
    image: "images/college/商學院_02.jpg"
}, {
    name: "工學院",
    location: "24.179113,120.647885",
    image: "images/college/工學院_02.jpg"
}, {
    name: "建設學院",
    location: "24.178318,120.648279",
    image: "images/college/建設學院_02.jpg"
}, {
    name: "金融學院",
    location: "24.178333,120.649845",
    image: "images/college/金融學院_02.jpg"
}, {
    name: "建築專業學院",
    location: "24.179184,120.647024",
    image: "images/college/建築專業學院_02.jpg"
}, {
    name: "國際科技與管理學院",
    location: "24.178655,120.648941",
    image: "images/college/國際科技與管理學院_02.jpg"
}, {
    name: "資電學院",
    location: "24.179240,120.649679",
    image: "images/college/資電學院_02.jpg"
}, {
    name: "人文社會學院",
    location: "24.179720,120.648625",
    image: "images/college/人文社會學院_02.jpg"
}, {
    name: "理學院",
    location: "24.181193,120.647328",
    image: "images/college/理學院_02.jpg"
}, {
    name: "經營管理學院",
    location: "24.201581,120.609402",
    image: "images/college/經營管理學院_02.jpg"
}, {
    name: "跨領域設計學院",
    location: "24.178626,120.647705",
    image: "images/college/跨領域設計學院_02.jpg"
}, {
    name: "學思樓",
    location: "24.181644,120.646841",
    image: "images/building/學思樓_02.jpg"
}, {
    name: "體育館",
    location: "24.181718,120.648741",
    image: "images/building/體育館_02.jpg"
}, {
    name: "土木水利館",
    location: "24.181195,120.647076",
    image: "images/building/土木水利館_02.jpg"
}, {
    name: "理學大樓",
    location: "24.181193,120.647328",
    image: "images/building/理學大樓_02.jpg"
}, {
    name: "育樂館",
    location: "24.180035,120.647014",
    image: "images/building/育樂館_02.jpg"
}, {
    name: "建築館",
    location: "24.179499,120.646715",
    image: "images/building/建築館_02.jpg"
}, {
    name: "語文大樓",
    location: "24.179842,120.646991",
    image: "images/building/語文大樓_02.jpg"
}, {
    name: "人言大樓",
    location: "24.179720,120.648625",
    image: "images/building/人言大樓_02.jpg"
}, {
    name: "人文社會館",
    location: "24.179816,120.649312",
    image: "images/building/人文社會館_02.jpg"
}, {
    name: "電子通訊館",
    location: "24.179831,120.649859",
    image: "images/building/電子通訊館_02.jpeg"
}, {
    name: "忠勤樓",
    location: "24.179184,120.647024",
    image: "images/building/忠勤樓_02.jpg"
}, {
    name: "工學館",
    location: "24.179113,120.647885",
    image: "images/building/工學館_02.jpg"
}, {
    name: "資訊電機館",
    location: "24.179240,120.649679",
    image: "images/building/資訊電機館_02.jpg"
}, {
    name: "圖書館",
    location: "24.178655,120.648941",
    image: "images/building/圖書館_02.jpg"
}, {
    name: "行政大樓",
    location: "24.178572,120.647032",
    image: "images/building/行政大樓_02.jpg"
}, {
    name: "行政二館",
    location: "24.178626,120.647705",
    image: "images/building/行政二館_02.jpg"
}, {
    name: "丘逢甲紀念館",
    location: "24.178318,120.648279",
    image: "images/building/丘逢甲紀念館_02.jpg"
}, {
    name: "科學與航太館",
    location: "24.178252,120.649086",
    image: "images/building/科學與航太館_02.jpg"
}, {
    name: "商學大樓",
    location: "24.178333,120.649845",
    image: "images/building/商學大樓_02.jpg"
}, {
    name: "學思園",
    location: "24.181552,120.647566",
    image: "images/landscape/學思園_02.jpg"
}, {
    name: "綜合體育場",
    location: "24.180908,120.649205",
    image: "images/landscape/綜合體育場_02.jpg"
}, {
    name: "文華創意中心",
    location: "24.181438,120.646590",
    image: "images/landscape/文華創意中心_02.jpg"
}, {
    name: "二一步道",
    location: "24.178705,120.648310",
    image: "images/landscape/二一步道_02.jpg"
}, {
    name: "分手步道",
    location: "24.178754,120.649757",
    image: "images/landscape/分手步道_02.jpg"
}, {
    name: "第一招待所",
    location: "24.179775,120.647734",
    image: "images/landscape/第一招待所_02.jpg"
}, {
    name: "榕榕大道",
    location: "24.178898,120.647730",
    image: "images/landscape/榕榕大道_02.jpg"
}]
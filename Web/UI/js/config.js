const BULLETIN_URL = 'http://10.21.22.34:3000/api/fcu/bulletin';

const BUILDING_URL = 'http://10.21.22.34:3000/api/fcu/building';
const BUILDING_DIALOG_URL = "http://10.21.22.34:3000/api/fcu/building/";

const COLLEGE_URL = 'http://10.21.22.34:3000/api/fcu/college';
const COLLEGE_DIALOG_URL = "http://10.21.22.34:3000/api/fcu/college/";

const LANDSCAPE_URL = 'http://10.21.22.34:3000/api/fcu/landscape';
const LANDSCAPE_DIALOG_URL = "http://10.21.22.34:3000/api/fcu/landscape/";


const markers = [{
        name: "商學院",
        location: "24.178333,120.649845"
    },
    {
        name: "工學院",
        location: "24.179113,120.647885"
    },
    {
        name: "建設學院",
        location: "24.178318,120.648279"
    },
    {
        name: "金融學院",
        location: "24.178333,120.649845"
    }, {
        name: "建築專業學院",
        location: "24.179184,120.647024"
    },
    {
        name: "國際科技與管理學院",
        location: "24.178655,120.648941"
    },
    {
        name: "資電學院",
        location: "24.179240,120.649679"
    },
    {
        name: "人文社會學院",
        location: "24.179720,120.648625"
    },
    {
        name: "理學院",
        location: "24.181193,120.647328"
    },
    {
        name: "經營管理學院",
        location: "24.201581,120.609402"
    },
    {
        name: "跨領域設計學院",
        location: "24.178626,120.647705"
    },
    {
        name: "學思樓",
        location: "24.181644,120.646841"
    },
    {
        name: "體育館",
        location: "24.181718,120.648741"
    },
    {
        name: "土木水利館",
        location: "24.181195,120.647076"
    },
    {
        name: "理學大樓",
        location: "24.181193,120.647328"
    },
    {
        name: "育樂館",
        location: "24.180035,120.647014"
    },
    {
        name: "建築館",
        location: "24.179499,120.646715"
    },
    {
        name: "語文大樓",
        location: "24.179842,120.646991"
    },
    {
        name: "人言大樓",
        location: "24.179720,120.648625"
    },
    {
        name: "人文社會館",
        location: "24.179816,120.649312"
    },
    {
        name: "電子通訊館",
        location: "24.179831,120.649859"
    },
    {
        name: "忠勤樓",
        location: "24.179184,120.647024"
    },
    {
        name: "工學館",
        location: "24.179113,120.647885"
    },
    {
        name: "資訊電機館",
        location: "24.179240,120.649679"
    },
    {
        name: "圖書館",
        location: "24.178655,120.648941"
    },
    {
        name: "行政大樓",
        location: "24.178572,120.647032"
    },
    {
        name: "行政二館",
        location: "24.178626,120.647705"
    },
    {
        name: "丘逢甲紀念館",
        location: "24.178318,120.648279"
    },
    {
        name: "科學與航太館",
        location: "24.178252,120.649086"
    },
    {
        name: "商學大樓",
        location: "24.178333,120.649845"
    },
    {
        name: "學思園",
        location: "24.181552,120.647566"
    },
    {
        name: "綜合體育場",
        location: "24.180908,120.649205"
    },
    {
        name: "文華創意中心",
        location: "24.181438,120.646590"
    },
    {
        name: "二一步道",
        location: "24.178705,120.648310"
    },
    {
        name: "分手步道",
        location: "24.178754,120.649757"
    },
    {
        name: "第一招待所",
        location: "24.179775,120.647734"
    },
    {
        name: "榕榕大道",
        location: "24.178898,120.647730"
    }
]
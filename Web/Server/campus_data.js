var XLSX = require('xlsx');
const workbook = XLSX.readFile('campus.xlsx');
const sheetNames = workbook.SheetNames;

const worksheet = workbook.Sheets[sheetNames[0]];
const campusDataJson = XLSX.utils.sheet_to_json(worksheet)

var campus = JSON.parse('{}');

// const campusDataJson = JSON.stringify(sheetToJson, 2, 2)


// campusDataJson.forEach(function(data) {
//     console.log(data['學院名稱'])
//     console.log(data['學院科系｜科系網址｜系辦位置｜聯絡電話'])
// }, this);

let data = campusDataJson[0]


parserDepartment(data['學院科系｜科系網址｜系辦位置｜聯絡電話'])
    // console.log(data['學院位置'])
    // console.log(data['學院介紹'])
    // console.log(data['學院圖片'])
    // console.log(data['學院歷史介紹'])
    // console.log(data['學院經緯度'])

function parserDepartment(data) {
    console.log(data.split('\n'))
}
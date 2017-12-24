var XLSX = require('xlsx');
var fs = require('fs');

const workbook = XLSX.readFile('campus.xlsx');
const sheetNames = workbook.SheetNames;

const worksheet = workbook.Sheets[sheetNames[1]];
const campusDataJson = XLSX.utils.sheet_to_json(worksheet)

var buildingSchema = JSON.parse('{}');
var CampusSchema = JSON.parse('[]');
var departmentList = []
var buildingID = 0;


campusDataJson.forEach(element => {
    buildingSchema = JSON.parse('{}')
    parserCampus(element)
    CampusSchema.push(buildingSchema);
})

function parserCampus(data) {
    buildingID++;
    buildingSchema['_id'] = buildingID;
    buildingSchema['building_name'] = data['大樓名稱']
    buildingSchema['building_type'] = data['大樓性質']

    buildingSchema['info'] = {
        "image": [],
    };

    buildingSchema['building_location'] = {
        "location": data['大樓位置']
    }
    buildingSchema['info']['introduction'] = data['大樓介紹'];

    let imageList = data['大樓圖片'].split('\n')

    imageList.forEach(element => {
        buildingSchema['info']['image'].push("images/building/" + element)
    });
}
// CampusSchema = JSON.stringify(CampusSchema, 2, 2)
fs.writeFileSync("building.json", JSON.stringify(CampusSchema));
var XLSX = require('xlsx');
var fs = require('fs');

const workbook = XLSX.readFile('campus.xlsx');
const sheetNames = workbook.SheetNames;

const worksheet = workbook.Sheets[sheetNames[2]];
const campusDataJson = XLSX.utils.sheet_to_json(worksheet)

var landscapeSchema = JSON.parse('{}');
var CampusSchema = JSON.parse('[]');
var departmentList = []
var landscapeID = 0;


campusDataJson.forEach(element => {
    landscapeSchema = JSON.parse('{}')
    parserCampus(element)
    CampusSchema.push(landscapeSchema);
})

function parserCampus(data) {
    landscapeID++;
    landscapeSchema['_id'] = landscapeID;
    landscapeSchema['landscape_name'] = data['景點名稱']

    landscapeSchema['info'] = {
        "image": [],
    };

    landscapeSchema['landscape_location'] = {
        "location": data['景點經緯度']
    }
    landscapeSchema['info']['introduction'] = data['景點介紹'];

    let imageList = data['景點圖片'].split('\n')

    imageList.forEach(element => {
        landscapeSchema['info']['image'].push("images/landscape/" + element)
    });
}
// CampusSchema = JSON.stringify(CampusSchema, 2, 2)
fs.writeFileSync("landscape.json", JSON.stringify(CampusSchema));


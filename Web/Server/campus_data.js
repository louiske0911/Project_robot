var XLSX = require('xlsx');
var fs = require('fs');

const workbook = XLSX.readFile('campus.xlsx');
const sheetNames = workbook.SheetNames;

const worksheet = workbook.Sheets[sheetNames[0]];
const campusDataJson = XLSX.utils.sheet_to_json(worksheet)

var collegeSchema = JSON.parse('{}');
var CampusSchema = JSON.parse('[]');
var departmentList = []
var collegeID = 0;

function parserCampus(data) {
    collegeID++;
    collegeSchema['_id'] = collegeID;
    collegeSchema['college_name'] = data['學院名稱']
    collegeSchema['info'] = {
        "image": [],
        "department": []
    };

    parserDepartment(data['學院科系｜科系網址｜系辦位置｜聯絡電話'])
    collegeSchema['college_location'] = {
        "college_building": data['學院位置'],
        "location": data['學院經緯度']
    }
    collegeSchema['info']['introduction'] = data['學院介紹'];
    collegeSchema['info']['history'] = data['學院歷史介紹'];

    let imageList = data['學院圖片'].split('\n')

    imageList.forEach(element => {
        collegeSchema['info']['image'].push("images/college/" + element)
    });
}

function parserDepartment(data) {
    var index = -1;
    data = data.split('\n');
    data.forEach(element => {
        if (element.indexOf("*") != -1) {
            index++;
            collegeSchema['info']['department'].push({
                "department_type": element.replace("*", "").replace("\r", "").replace("：", "")
            })
            collegeSchema['info']['department'][index]['department_list'] = [];

        } else if (element.indexOf("｜") != -1) {
            element = element.split("｜");
            collegeSchema['info']['department'][index]['department_list'].push({
                "department_name": element[0],
                "department_url": element[1],
                "department_location": element[2],
                "department_phone": element[3]
            })
        }
    });
}



for (var i = 0; i < campusDataJson.length; i++) {
    collegeSchema = JSON.parse('{}');
    parserCampus(campusDataJson[i])
    CampusSchema.push(collegeSchema);
}

// CampusSchema = JSON.stringify(CampusSchema, 2, 2)
console.log(CampusSchema)
fs.writeFileSync("college.json", JSON.stringify(CampusSchema));


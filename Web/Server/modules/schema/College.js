const mongoose = require('mongoose');

// College Schema
const collegeSchema = mongoose.Schema({
    _college_id: Number,
    college_name: String,
    college_location: {
        type: Object,
        college_building: String,
        latitude: Number,
        longitude: Number
    },
    info: {
        type: Object,
        introduction: String,
        image: String,
        department: {
            type: Object,
            department_type: String,
            department_list: [{
                type: Array,
                department_name: String,
                department_url: String
            }]

        }
    }
});


const College = module.exports = mongoose.model('College', collegeSchema, 'college');

// Get College
// module.exports.getCollege = (callback, limit) => {
// College.find(callback).limit(limit);
// }
module.exports = College;
const mongoose = require('mongoose');

// Building Schema
const buildingSchema = new mongoose.Schema({
    _building_id: Number,
    building_name: String,
    building_type: String,
    building_location: {
        type: Object,
        latitude: Number,
        longitude: Number
    },
    info: {
        type: Object,
        introduction: String,
        image: {
            type: Array,
            image_location: String
        },
        floor_count: Number
    }
});


const Building = module.exports = mongoose.model('Building', buildingSchema, 'building');

// Get College
// module.exports.getCollege = (callback, limit) => {
// College.find(callback).limit(limit);
// }
module.exports = Building;
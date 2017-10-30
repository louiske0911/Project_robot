const mongoose = require('mongoose');

// Landscape Schema
const landscapeSchema = new mongoose.Schema({
    landscape_id: Number,
    landscape_name: String,
    landscape_location: {
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
        }
    }
});


const Landscape = module.exports = mongoose.model('Landscape', landscapeSchema, 'landscape');

// Get College
// module.exports.getCollege = (callback, limit) => {
// College.find(callback).limit(limit);
// }
module.exports = Landscape;
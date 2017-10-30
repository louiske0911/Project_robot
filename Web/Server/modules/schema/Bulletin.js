const mongoose = require('mongoose');

// Bulletin Schema
const bulletinSchema = new mongoose.Schema({
    _bulletin_id: Number,
    bulietin_carousel: {
        type: Object,
        url: String,
        image_url: String
    },
    bulletin_news: {
        type: Object,
        news_theme: String,
        news_url: String,
        news_content: String
    },
    bulletin_announce: {
        type: Object,
        announce_theme: String,
        announce_url: String,
        announce_content: String
    },
    bulletin_activity: {
        type: Object,
        activity_theme: String,
        activity_url: String,
        activity_content: String
    },
    bulletin_lecture: {
        type: Object,
        lecture_theme: String,
        lecture_url: String,
        lecture_content: String
    }
});


const Bulletin = module.exports = mongoose.model('Bulletin', bulletinSchema, 'bulletin');

module.exports = Bulletin;
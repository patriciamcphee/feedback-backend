const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true,
    },
    options: [{
        type: String
    }],
    comment: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
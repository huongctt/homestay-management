const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    homestay: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homestay'
    },
    comment: {
        type: String
    },
    rate: {
        type: Number
    }
},{
    timestamps: true
});



const Review = mongoose.model('Review', Schema);

module.exports = Review;
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
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    checkin: {
        type: Date,
        required: true
    },
    checkout: {
        type: Date,
        required: true
    },
    status: {
        type: Number,
        required: true
    }
},{
    timestamps: true
});



const Booking = mongoose.model('Booking', Schema);

module.exports = Booking;
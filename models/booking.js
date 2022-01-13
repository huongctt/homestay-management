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
    phone: {
        type: String,
        required: true
    },
    people: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        default: "none"
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
        type: String,
        enum: ["requested", "accepted", "stayed", "declined", "reviewed"],
        required: true
    },
    money: {
        type: Number
    }
},{
    timestamps: true
});



const Booking = mongoose.model('Booking', Schema);

module.exports = Booking;
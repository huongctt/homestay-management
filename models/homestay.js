const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imagePost: [{
        type: Buffer
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    people: {
        type: String,
        required: true
    }
},{
    timestamps: true
});



const Homestay = mongoose.model('Homestay', Schema);

module.exports = Homestay;
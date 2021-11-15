const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    homestay: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homestay'
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
},{
    timestamps: true
});



const Service = mongoose.model('Service', Schema);

module.exports = Service;
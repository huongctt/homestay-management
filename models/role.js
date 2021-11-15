const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    role: {
        type: String
    }
},{timestamps: true});

const  Role = mongoose.model('Role', Schema);

module.exports = Role;
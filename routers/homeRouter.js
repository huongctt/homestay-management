const express = require ('express')
const cookies = require("cookie-parser")
const sharp = require('sharp')
const bodyParser = require("body-parser")  

const User = require('../models/user.js')
const Role = require('../models/role.js')
const auth = require('../middleware/auth.js')
const Booking = require('../models/booking.js')

const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookies());

router.get('/home', auth, async (req,res) => {
    const bookings = await Booking.find({user: req.user, status: "stayed"})
    res.render('index', {user: req.user, bookings})
})

module.exports = router
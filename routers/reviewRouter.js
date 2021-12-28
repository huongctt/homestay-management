const express = require ('express')
const cookies = require("cookie-parser")
const bodyParser = require("body-parser")  

const User = require('../models/user.js')
const Homestay = require('../models/homestay.js')
const Booking = require('../models/booking.js')
const Review = require('../models/review.js')
const auth = require('../middleware/auth.js')

const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookies());

router.post('/reviews/:bookingId', auth, async (req,res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
    const review = new Review({
      ...req.body,
      homestay: booking.homestay,
      user: req.user
    })
    await review.save();
    booking.status= "reviewed"
    await booking.save()
    res.redirect('/yourbooking')
  } catch (e) {
    res.send(e)
  }
})

router.get('/reviews/:bookingId', auth, async (req,res) => {
  console.log("1")
  try {
    console.log(req.params.bookingId)
    const booking = await Booking.findById(req.params.bookingId)
    console.log(booking)
    console.log("2")
    await booking.populate({
      path: 'homestay', 
    }).execPopulate();
    console.log(booking)
    res.render("review", {booking})
  } catch (e) {
    res.send(e)
  }
})

module.exports = router
const express = require ('express')
const cookies = require("cookie-parser")
const sharp = require('sharp')
const bodyParser = require("body-parser")  

const User = require('../models/user.js')
const Homestay = require('../models/homestay.js')
const Booking = require('../models/booking.js')
const auth = require('../middleware/auth.js')

const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookies());

function setDate(dateString) {
  var splitDate = dateString.split("/");
  var date = splitDate[2] + '-' + splitDate[0] + '-' + splitDate[1]
  var result = new Date(date)
  return result
}

router.post('/search', auth, async (req,res) => {
  const checkintime = setDate(req.body.checkin)
  const checkouttime = setDate(req.body.checkout)
  const booked = await Booking.find({
      $or: [
          { checkin: { $gte: checkintime, $lte: checkouttime } },
          {
              checkout: { $gte: checkintime, $lte: checkouttime }
          },
          {
              $and: [{ checkin: { $lte: checkintime } }, { checkout: { $gte: checkouttime } }]
          },
      ],
      status: {$in: ["accepted", "stayed", "reviewed"]}
  })
  var unavailable = []
  for (var i = 0; i < booked.length; i++) {
    unavailable.push(booked[i].homestay)
  }
  const homestays = await Homestay.find({city: req.body.city, price: { $gte: 0, $lte: req.body.price } , _id: {$nin: unavailable}})
  res.status(200).render('search', {user: req.user, homestays} )
})

router.get('/books/:id', auth, async (req,res) => {
  const homestay = await Homestay.findById(req.params.id)
  res.status(200).render('bookform', {user: req.user, homestay} )
})

router.get('/yourbooking', auth, async (req,res) => {
  const bookings = await Booking.find({user: req.user})
  for (var i = 0; i < bookings.length; i++){
    await bookings[i].populate({
      path: 'homestay', 
    }).execPopulate();
  }
  bookings.sort((a,b) => b.createdAt - a.createdAt)
  res.status(200).render('yourbooking', {user: req.user, bookings} )
})


router.post('/books/:id', auth, async (req,res) => {
  const homestay = await Homestay.findById(req.params.id)
  const booking = new Booking({
    ...req.body,  
    user: req.user._id,
    homestay: homestay._id,
    status: "requested"
  })
  var datecheckin = new Date(req.body.checkin)
  var datecheckout = new Date(req.body.checkout)
  var date = (datecheckout - datecheckin)/(60 * 60 * 24 * 1000)
  booking.money = homestay.price * date
  await booking.save()
  res.redirect('/yourbooking')
})

router.post('/books/:id/accept', auth, async (req,res) => {
  const booking = await Booking.findById(req.params.id)
  booking.status = "accepted"
  await booking.save()
  res.redirect('back')
})

router.post('/books/:id/decline', auth, async (req,res) => {
  const booking = await Booking.findById(req.params.id)
  booking.status = "declined"
  await booking.save()
  res.redirect('back')
})

router.post('/books/:id/stay', auth, async (req,res) => {
  const booking = await Booking.findById(req.params.id)
  booking.status = "stayed"
  await booking.save()
  res.redirect('back')
})

module.exports = router
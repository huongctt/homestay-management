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

router.get('/homestays/:id/bookinglist', auth, async (req,res) => {
  const homestay = await Homestay.findById(req.params.id)
  var requestedBookings = []
  var date
  
  if (req.query.username && req.query.time && req.query.time != "all" ) {
    var username = req.query.username 
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        requestedBookings = await Booking.find({homestay: req.params.id,status: "requested", user: {$in: ids}, createdAt: {
          $lte:new Date(),
          $gte: date
        }})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.username && req.query.time == "all"){
    var username = req.query.username 
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        requestedBookings = await Booking.find({homestay: req.params.id,status: "requested", user: {$in: ids}})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.time && req.query.time != "all"){
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    requestedBookings = await Booking.find({homestay: req.params.id,status: "requested", createdAt: {
      $lte:new Date(),
      $gte: date
    }})
  } else {
  //requested
    requestedBookings = await Booking.find({homestay: req.params.id, status: "requested"})
  }
  for (var i = 0; i < requestedBookings.length; i++){
    await requestedBookings[i].populate({
      path: 'user', 
    }).execPopulate();
  }
  res.status(200).render('homestayBookingList', {user: req.user, homestay, requestedBookings} )
})

router.get('/homestays/:id/acceptedlist', auth, async (req,res) => {
  const homestay = await Homestay.findById(req.params.id)
  var acceptedBookings = []
  var date

  if (req.query.username && req.query.time && req.query.time != "all" ) {
    var username = req.query.username 
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        acceptedBookings = await Booking.find({homestay: req.params.id,status: "accepted", user: {$in: ids}, createdAt: {
          $lte:new Date(),
          $gte: date
        }})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.username && req.query.time == "all"){
    var username = req.query.username 
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        acceptedBookings = await Booking.find({homestay: req.params.id,status: "accepted", user: {$in: ids}})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.time && req.query.time != "all"){
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    acceptedBookings = await Booking.find({homestay: req.params.id,status: "accepted", createdAt: {
      $lte:new Date(),
      $gte: date
    }})
  } else {
    //accepted
    acceptedBookings = await Booking.find({homestay: req.params.id, status: "accepted"})
  }
  for (var i = 0; i < acceptedBookings.length; i++){
    await acceptedBookings[i].populate({
      path: 'user', 
    }).execPopulate();
  }
  res.status(200).render('homestayAcceptedList', {user: req.user, homestay, acceptedBookings} )
})

router.get('/homestays/:id/declinedlist', auth, async (req,res) => {
  const homestay = await Homestay.findById(req.params.id)
  var declinedBookings = []
  var date
  if (req.query.username && req.query.time && req.query.time != "all" ) {
    var username = req.query.username 
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        declinedBookings = await Booking.find({homestay: req.params.id,status: "declined", user: {$in: ids}, createdAt: {
          $lte:new Date(),
          $gte: date
        }})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.username && req.query.time == "all"){
    var username = req.query.username 
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        declinedBookings = await Booking.find({homestay: req.params.id,status: "declined", user: {$in: ids}})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.time && req.query.time != "all"){
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    declinedBookings = await Booking.find({homestay: req.params.id,status: "declined", createdAt: {
      $lte:new Date(),
      $gte: date
    }})
  } else {
  //declined
    declinedBookings = await Booking.find({homestay: req.params.id, status: "declined"})
  }
  for (var i = 0; i < declinedBookings.length; i++){
    await declinedBookings[i].populate({
      path: 'user', 
    }).execPopulate();
  }

  res.status(200).render('homestayDeclinedList', {user: req.user, homestay, declinedBookings} )
})

router.get('/homestays/:id/stayedlist', auth, async (req,res) => {
  const homestay = await Homestay.findById(req.params.id)
  var stayedBookings = []
  var date
  //stayed
  if (req.query.username && req.query.time && req.query.time != "all" ) {
    var username = req.query.username 
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        stayedBookings = await Booking.find({homestay: req.params.id,status: {$in: [ "stayed", "reviewed"]}, user: {$in: ids}, createdAt: {
          $lte:new Date(),
          $gte: date
        }})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.username && req.query.time == "all"){
    var username = req.query.username 
    try {
        var users = await User.find({name: { '$regex' : username, '$options' : 'i' }})  
        var ids = users.map(function(user) { return user._id; });
        stayedBookings = await Booking.find({homestay: req.params.id,status: {$in: [ "stayed", "reviewed"]}, user: {$in: ids}})
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
  } else if (req.query.time && req.query.time != "all"){
    if (req.query.time == "thisweek") {
      date = new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
    } else if (req.query.time == "thismonth") {
      date = new Date(new Date() - 30 * 60 * 60 * 24 * 1000)
    }
    stayedBookings = await Booking.find({homestay: req.params.id,status: {$in: [ "stayed", "reviewed"]}, createdAt: {
      $lte:new Date(),
      $gte: date
    }})
  } else {
    stayedBookings = await Booking.find({homestay: req.params.id,status: {$in: [ "stayed", "reviewed"]}})
  }
  for (var i = 0; i < stayedBookings.length; i++){
    await stayedBookings[i].populate({
      path: 'user', 
    }).execPopulate();
  }

  res.status(200).render('homestayStayedList', {user: req.user, homestay, stayedBookings} )
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
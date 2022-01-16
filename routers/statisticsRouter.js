const express = require ('express')
const cookies = require("cookie-parser")
const sharp = require('sharp')
const bodyParser = require("body-parser")  

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user.js')
const Homestay = require('../models/homestay.js')
const Booking = require('../models/booking.js')
const auth = require('../middleware/auth.js')


const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookies());

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
  acceptedBookings.sort((a,b) => b.createdAt - a.createdAt)
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
  declinedBookings.sort((a,b) => b.createdAt - a.createdAt)

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
  stayedBookings.sort((a,b) => b.createdAt - a.createdAt)

  res.status(200).render('homestayStayedList', {user: req.user, homestay, stayedBookings} )
})

router.get('/homestays/:id/statistics', auth, async (req,res) => {
  var list = [0,0,0,0,0,0,0,0,0,0,0,0];
  var total = 0;
  var quarterList = [0,0,0,0];
  var quarterMax = 0
  var max = 0
  var type = "Type"
  const homestay = await Homestay.findById(req.params.id)
  if (!req.query.year) {
    yearString = "None"
  } else {
    yearString = req.query.year
  }
  if (req.query.type == "Money") {
    type = "Money"
    filter = "$money"
  } else if (req.query.type == "Guests") {
    type = "Guests"
    filter = "$people"
  }
  if (req.query.year && req.query.year != "None") {
    const year = parseInt(req.query.year)
    const moneyBooking = await Booking.aggregate([
      { $match: {
          homestay: ObjectId(req.params.id),
          status: {$in: [ "stayed", "reviewed"]},
          $expr: { "$eq": [{ "$year": "$checkout" }, year] }
        } 
      },
      {
        $group:
          {
            _id: { month: { $month: "$checkout"}, year: { $year: "$checkout" } },
            total: { $sum: filter }
          }
        }
      ]
    )
    for (var i = 0; i < moneyBooking.length; i++){
      list[moneyBooking[i]._id.month - 1] = moneyBooking[i].total 
      total += moneyBooking[i].total 
      if (moneyBooking[i].total > max ){
        max = moneyBooking[i].total
      }
    }
    for (var i = 0; i < list.length; i++) {
      if (list[i] != 0){
        quarterList[parseInt(i/3)] += list[i]
      }
    }
    quarterMax = quarterList.reduce(function(a, b) {
      return Math.max(a, b);
    }, 0);
    
  }
  res.status(200).render('statistics', {user: req.user,homestay, list, total, max, year: yearString, quarterList, quarterMax, type})
})

module.exports = router
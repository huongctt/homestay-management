const express = require ('express')
const cookies = require("cookie-parser")
const sharp = require('sharp')
const bodyParser = require("body-parser")  

const User = require('../models/user.js')
const Homestay = require('../models/homestay.js')
const auth = require('../middleware/auth.js')

const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookies());

router.get('/homestays/new', auth, async (req,res) => {
    res.render('newhomestay', {user: req.user})
})

router.get('/homestays/yourhomestays', auth, async (req,res) => {
    const homestays = await Homestay.find({owner: req.user.id})
    res.render('yourhomestays', {user: req.user, homestays: homestays})
})

router.post('/homestays/new', auth, async (req,res) => {
    // console.log(req.body)
    const homestay = new Homestay({
        ...req.body,  
        owner: req.user._id
    })
    // console.log(homestay)
    try {      
        await homestay.save()
        res.redirect('/home')
    } catch (e) {
        res.status(400).send(e)
        console.log("Error: " + e)
    }
})

module.exports = router
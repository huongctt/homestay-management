const express = require ('express')
const sharp = require('sharp')
const multer = require('multer')
const bodyParser = require("body-parser")  

const User = require('../models/user.js')
const Homestay = require('../models/homestay.js')
const Review = require('../models/review.js')
const auth = require('../middleware/auth.js')

const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file,cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please update an image'))
        }
        cb(undefined, true)
    }
})

router.get('/homestays/new', auth, async (req,res) => {
    res.render('newhomestay', {user: req.user})
})

router.get('/homestays/yourhomestays', auth, async (req,res) => {
    const homestays = await Homestay.find({owner: req.user.id})
    res.render('yourhomestays', {user: req.user, homestays: homestays})
})

router.post('/homestays/new', auth,upload.array('image'), async (req,res) => {
    // console.log(req.body)
    // console.log(req.files)
    const homestay = new Homestay({
        ...req.body,  
        owner: req.user._id
    })
    for (let i = 0; i < req.files.length; i++){
        const buffer = await sharp(req.files[i].buffer).resize({width:550, height:500}).png().toBuffer()
        homestay.images.push(buffer)
    }
    // console.log(homestay)
    try {      
        await homestay.save()
        res.redirect('/homestays/yourhomestays')
    } catch (e) {
        res.status(400).send(e)
        console.log("Error: " + e)
    }
})

router.get('/homestays/:id/images', async (req, res) => {
    try {
        const homestay = await Homestay.findById(req.params.id)
        if (!homestay || homestay.images.length == 0) {
            throw new Error()
        }else {
            res.set('Content-Type', 'image/png')
            res.send(homestay.images[req.query.index])
        }

    } catch(e) {
        res.status(404).send()
        console.log(e)
    }
})

router.get('/homestays/:id', auth, async (req, res) => {
    try {
        const homestay = await Homestay.findById(req.params.id)
        if (!homestay) {
            throw new Error()
        }else {
            const owner = await User.findById(homestay.owner)
            await owner.populate({
                path: 'homestays', 
            }).execPopulate();
            const reviews = await Review.find({homestay: req.params.id});
            for (var review of reviews) {
                await review.populate({
                    path: 'user', 
                }).execPopulate();
            }
            reviews.sort((a,b) => b.createdAt - a.createdAt)
            res.render('homestay', {user: req.user, homestay: homestay, owner: owner, reviews: reviews})
        }

    } catch(e) {
        res.status(404).send()
        console.log(e)
    }
})

router.post('/homestays/delete/:id', auth, async (req, res) => {
    try {
        console.log("delete")
        //const task = await Task.findByIdAndDelete(req.params.id)
        const homestay = await Homestay.findByIdAndDelete({_id: req.params.id, owner: req.user._id})
        if (!homestay) {
            return res.status(404).send()
        }
        res.redirect('/homestays/yourhomestays')

    } catch (e) {
        res.status(500).send()
    }
})

router.get('/homestays/:id/edit', auth, async(req,res) => {
    const homestay = await Homestay.findById(req.params.id)
    res.render('edithomestay', {homestay: homestay, user: req.user})
})

router.post('/homestays/:id/edit', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const homestay = await Homestay.findById(req.params.id)
    try {
        updates.forEach((update) => homestay[update] = req.body[update])
        await homestay.save()
        var path = '../../homestays/' + homestay._id
        res.redirect(path)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
const express = require ('express')
const cookies = require("cookie-parser")
const sharp = require('sharp')
const bodyParser = require("body-parser")  

const User = require('../models/user.js')
const Role = require('../models/role.js')
const auth = require('../middleware/auth.js')

const router = new express.Router()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookies());

router.get('/login', (req,res) => {
    res.render('login')
})

router.get('/register', (req,res) => {
    res.render('register')
})

router.post('/users/register', async (req, res) => {
    const user = new User ({
        ...req.body
    })
    // console.log(user)
    try {      
        await user.save()
        const token = await user.generateAuthToken()
        res.cookie('authToken', token,{httpOnly: true, maxAge: 3600000})
        // console.log(user)
        // res.status(201).send({user})
        res.redirect('/home')
    } catch (e) {
        res.status(400).send(e)
        console.log("Error: " + e)
    }

})

//login
router.post('/users/login', async (req, res) => {
    try {
        console.log(req.body)
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('authToken', token,{httpOnly: true, maxAge: 3600000})
        console.log(res.cookie)
        
        // res.send({user,token})
        res.redirect('/home')
    } catch(e) {
        res.status(400).send()
        console.log(e)
    }
})


router.get('/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        console.log("ok")
        // res.status(200).send()
        res.render('login')
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
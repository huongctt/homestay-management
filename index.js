require ('./models/mongoose')
const express = require('express')
const hbs = require('ejs')
const cookies = require("cookie-parser");
const path = require('path')
const bodyParser = require("body-parser") 
const http = require('http')
const auth = require('./middleware/auth.js')

const app = express()
const server = http.createServer(app)
const port = process.env.PORT ||3000
app.use(express.json())

//router
const userRouter = require('./routers/userRouter.js')
const homeRouter = require('./routers/homeRouter.js')
const homestayRouter = require('./routers/homestayRouter.js')
const bookRouter = require('./routers/bookRouter.js')
const reviewRouter = require('./routers/reviewRouter.js')
app.use(userRouter)
app.use(homeRouter)
app.use(homestayRouter)
app.use(bookRouter)
app.use(reviewRouter)
// app.use(friendRouter)

//view
const viewsPath = path.join(__dirname, './views')
const publicDirectoryPath = path.join(__dirname, './views')
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs')
app.set('views', viewsPath)
app.use(express.static(publicDirectoryPath))
app.use(cookies());


app.get('', async (req,res) => {
    res.render('login')
})

server.listen(port, () => {
    console.log('Server is up!')
})



const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/homestay',{
    useNewUrlParser: true,
    useCreateIndex: true ,
    useUnifiedTopology: true,
    useFindAndModify: false
})
//comment :    /Users/Admin/mongodb/bin/mongod --dbpath=/Users/Admin/mongodb_data
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    username: {
        type: String,
        minlength: 3,
        maxlength: 30,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        trim: true,
        maxlength: 40
    },
    password: {
        trim: true,
        minlength: 3,
        type: String,
    },
    role: {
        type: String
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.virtual('homestays', {
    ref: 'Homestay',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'homestay')
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne( {username})
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//hash password
userSchema.pre('save', async function (next) {
    const user = this

    // console.log('before saving')
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


const User = mongoose.model("User", userSchema);
module.exports = User;
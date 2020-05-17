const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://127.0.0.1:27017/file-server', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        require: true,
        unique: true,
        trim:true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        require: true,
        trim:true
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }}]
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne( {email} );
    if(!user) {
        throw new Error ('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to login');
    }
    return user
 }
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign( {email: user.email, _id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '2h'});

    user.tokens = user.tokens.concat ( {token} );
    await user.save(); 
    return {
        token: token,
        expiresIn: 7200,
        userId: user._id
    };
}

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.confirmPassword;
    delete userObject.tokens;

    return userObject;
}
// userSchema.pre('save', async function(next) {
//     const user = this;
    
//     user.password = await bcrypt.hash(user.password, 8);
//     user.confirmPassword = await bcrypt.hash(user.confirmPassword, 8);
//     next();
// })
const User = mongoose.model('User', userSchema);
module.exports = User;
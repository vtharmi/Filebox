const mongoose = require('mongoose');

const resetToeknSchema = new mongoose.Schema({
    userId: {
       required: true,
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User' 
    },
    resetToken: {
        required: true,
        type: String
    },
    createdAt: {
        required: true,
        type: Date,
        default: Date.now(),
        expires: 43200
    }
})

const PasswordResetToken = mongoose.model('passwordResetToken', resetToeknSchema);
module.exports = PasswordResetToken;
const mongoose = require('mongoose');
const userFileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdDate: {
        type: Number,
        required: true
    },
    modifiedDate: {
        type: Number,
        required: true
    },
    size: {
        required: true,
        type: String
    },
    extension: {
        required: true,
        type: String
    },
    filePath: {
        type: String,
        required: true
    },
    creator: {
        type:mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
})

const UserFile = mongoose.model('UserFile', userFileSchema)
module.exports = UserFile;
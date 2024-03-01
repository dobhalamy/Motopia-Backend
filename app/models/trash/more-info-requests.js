const mongoose = require('mongoose');
const { Schema } = mongoose;

const moreInfoSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Miss Date of More Info request'],
    },
    firstName: {
        type: String,
        required: [true, 'Miss Firstname of More Info request'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Miss Lastname of More Info request'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Miss Email of More Info request'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Miss Phone of More Info request'],
        trim: true,
    },
    comment: String,
    stockId: {
        type: String,
        required: [true, 'Miss Car\'s Stock ID of More Info request. Must be a string'],
    },
    reviewed: {
        type: Boolean,
        default: false,
    },
});

const MoreInfo = mongoose.model('More-Info-Request', moreInfoSchema);

module.exports = MoreInfo;

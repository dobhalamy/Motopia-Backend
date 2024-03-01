const mongoose = require('mongoose');
const { Schema } = mongoose;

const carFaxSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Miss Date of CarFax request'],
    },
    firstName: {
        type: String,
        required: [true, 'Miss Firstname of CarFax request'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Miss Lastname of CarFax request'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Miss Email of CarFax request'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Miss Phone of CarFax request'],
        trim: true,
    },
    comment: {
        type: String,
        required: [true, 'Miss Comment of CarFax request'],
    },
    vin: {
        type: String,
        required: [true, 'Miss Car\'s VIN of CarFax request. Must be a string'],
    },
    stockId: {
        type: String,
        required: [true, 'Miss Car\'s Stock ID of CarFax request. Must be a number'],
    },
    reviewed: {
        type: Boolean,
        default: false,
    },
});

const CarFax = mongoose.model('CarFax-Request', carFaxSchema);

module.exports = CarFax;

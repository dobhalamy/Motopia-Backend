const mongoose = require('mongoose');
const { Schema } = mongoose;

const trandeInSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Miss Date of Trade In request'],
    },
    firstName: {
        type: String,
        required: [true, 'Miss Firstname of Trade In request'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Miss Lastname of Trade In request'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Miss Email of Trade In request'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Miss Phone of Trade In request'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Miss Description of Trade In request'],
    },
    vin: {
        type: String,
        required: [true, 'Miss Car\'s VIN of Trade In request. Must be a string'],
    },
    mileage: {
        type: Number,
        required: [true, 'Miss Car\'s miles of Trade In request. Must be a number'],
    },
    reviewed: {
        type: Boolean,
        default: false,
    },
});

const TradeIn = mongoose.model('Trade-In-Request', trandeInSchema);

module.exports = TradeIn;

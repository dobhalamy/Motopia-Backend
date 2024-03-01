const mongoose = require('mongoose');
const { Schema } = mongoose;

const carPurchaseSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Miss Date of Car Purcahse request'],
    },
    firstName: {
        type: String,
        required: [true, 'Miss Firstname of Car Purcahse request'],
        trim: true,
    },
    middleName: {
        type: String,
        required: [true, 'Miss Middlename of Car Purcahse request'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Miss Lastname of Car Purcahse request'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Miss Email of Car Purcahse request'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Miss Phone of Car Purcahse request'],
        trim: true,
    },
    downPayment: {
        type: Number,
        required: [true, 'Miss Downpayment amount of Car Purcahse request. Must be a number'],
    },
    perMonthPayment: {
        type: Number,
        required: [true, 'Miss Per Month Payment amount of Car Purcahse request. Must be a number'],
    },
    monthPeriod: {
        type: Number,
        required: [true, 'Miss Month Period of Car Purcahse request. Must be a number'],
    },
    bank: {
        type: String,
        required: [true, 'Miss Bank of Car Purcahse request. Must be a string'],
    },
    stockId: {
        type: String,
        required: [true, 'Miss Car\'s Stock ID of Car Purcahse request. Must be a string'],
    },
    reviewed: {
        type: Boolean,
        default: false,
    },
}, {
    versionKey: false
});

const CarPurchase = mongoose.model('Car-Purchase', carPurchaseSchema);

module.exports = CarPurchase;

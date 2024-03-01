const mongoose = require("mongoose");
const { Schema } = mongoose;
const savingsJobsModel = require('./saving-jobs');

const SavingSchema = new Schema({
    prospectId: Number,
    creditAppId: Number,
    stockid: Number,
    downPayment: Number,
    monthlyPayment: Number,
    monthlyPaymentPeriod: Number,
    banksInfo: Array,
    minDownPayment: Number,
    maxDownPayment: Number,
    minMonthlyPayment: Number,
    maxMonthlyPayment: Number,
    preferredBankByMonthlyPayment: Object,
    job: String
}, {
    versionKey: false
});

SavingSchema.pre('save', function(next) {
    const { banksInfo } = this;
    this.minDownPayment = Math.min(...banksInfo.map(bank => bank.downPayment));
    this.maxDownPayment = Math.max(...banksInfo.map(bank => bank.downPayment));
    this.minMonthlyPayment = Math.min(...banksInfo.map(bank => bank.payment));
    this.minNotZeroMonthlyPayment = Math.min(...banksInfo.filter(bank => bank.payment > 0).map(bank => bank.payment));
    this.maxMonthlyPayment = Math.max(...banksInfo.map(bank => bank.payment));
    this.preferredBankByMonthlyPayment = [...banksInfo].find(bank => parseFloat(bank.payment) === this.minNotZeroMonthlyPayment);

    this.downPayment = this.minDownPayment;
    this.monthlyPayment = this.minNotZeroMonthlyPayment;
    this.monthlyPaymentPeriod = this.preferredBankByMonthlyPayment.term;
    next();
});

SavingSchema.pre('deleteOne', async function(next) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
        await savingsJobsModel.deleteOne({ name: String(doc._id) });
    }
    next();
});

const SavingPayment = mongoose.model("saving-payment", SavingSchema);

module.exports = SavingPayment;
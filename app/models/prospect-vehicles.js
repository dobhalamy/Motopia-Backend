const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProspectVehicleSchema = new Schema(
  {
    prospectId: Number,
    stockid: Number,
    downPayment: Number,
    monthlyPayment: Number,
    monthlyPaymentPeriod: Number,
    make: String,
    model: String,
    carYear: Number,
    series: String,
    appStatus: String,
  },
  {
    versionKey: false,
  }
);

const ProspectVehicle = mongoose.model(
  'prospect-vehicle',
  ProspectVehicleSchema
);

module.exports = ProspectVehicle;

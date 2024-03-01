const amountModel = require("../models/approved-amounts");
const savingsModel = require('../models/saving-payments');

exports.deleteAmount =  _id => {
  amountModel.deleteOne({ _id })
    .then()
    .catch(err => console.error(err));
};

exports.deleteSavings = _id => {
  savingsModel.deleteOne({ _id })
    .then()
    .catch(err => console.error(err));
};
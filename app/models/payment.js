const mongoose = require("mongoose");
const { Schema } = mongoose;

const NumberReq = {
  type: Number,
  required: true,
};

const paymentSchema = new Schema({
    cardHolder: String,
    cardNumber: String,
    expiry: String,
    cvv: String,
    amountPay: String,
    holderEmail: String,
    paymentType: String,
    firstName: String,
    lastName: String,
    zip: String,
    contactNumber: String,
    statusCodePayment: String,
    transactionId: String,
    paymentStatus: String,
    invoiceNumber: String,
    creditAppId: String,
    prospectId: String
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;

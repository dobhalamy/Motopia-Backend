const mongoose = require("mongoose");
const { Schema } = mongoose;

const NumberReq = {
  type: Number,
  required: true,
};

const pricesSchema = new Schema(
  {
    lockDown: NumberReq,
    downPayment: NumberReq,
    retailDeposit: NumberReq,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Price = mongoose.model("price", pricesSchema);

module.exports = Price;

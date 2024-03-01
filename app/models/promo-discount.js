const mongoose = require('mongoose');
const { Schema } = mongoose;

const DiscountSchema = new Schema(
  {
    saleDiscount: Number,
    rentDiscount: Number,
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

const Discount = mongoose.model('promo-discount', DiscountSchema);
module.exports = Discount;

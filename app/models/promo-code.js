const mongoose = require('mongoose');
const { Schema } = mongoose;

const PromoCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    link: String,
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'promo-discount',
    },
    rentWeeklyDiscount: String,
    partnerSaleDiscount: Number,
    partnerRentDiscount: Number,
    saleDiscount: Number,
    rentDiscount: Number,
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

PromoCodeSchema.pre('save', function (next) {
  const { code } = this;
  this.link = `https://gomotopia.com?promo=${code}`;
  next();
});

const PromoCode = mongoose.model('promo-code', PromoCodeSchema);
module.exports = PromoCode;

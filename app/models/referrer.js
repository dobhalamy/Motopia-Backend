const mongoose = require('mongoose');
const { Schema } = mongoose;
const PromoCodeModel = require('./promo-code');

const ReferrerSchema = new Schema(
  {
    prospectId: Number,
    name: String,
    prospectPhoneNumber: String,
    referralSource: {
      type: Schema.Types.ObjectId,
      ref: 'promo-referrer',
    },
    promoCode: {
      type: Schema.Types.ObjectId,
      ref: 'promo-code',
    },
    isPartner: {
      type: Boolean,
      default: false,
    },
    isRentalWeeklyDiscount: {
      type: Boolean,
      default: false,
    },
    isPurchased: {
      type: Boolean,
      default: false,
    },
    dealType: {
      type: String,
    },
    source: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

ReferrerSchema.pre('findOneAndDelete', async function (next) {
  await PromoCodeModel.findOneAndDelete({ _id: this.promoCode });
  next();
});

const Referrer = mongoose.model('promo-referrer', ReferrerSchema);
module.exports = Referrer;

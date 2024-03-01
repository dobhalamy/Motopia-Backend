const mongoose = require("mongoose");
const { Schema } = mongoose;

const NumberReq = {
  type: Number,
  required: true,
};

const deliverySchema = new Schema(
  {
    deliveryDays: NumberReq,
    deliveryMiles: NumberReq,
    isRideShareEnabled: Boolean,
    deliveryFee: NumberReq,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Delivery = mongoose.model("delivery", deliverySchema);

module.exports = Delivery;

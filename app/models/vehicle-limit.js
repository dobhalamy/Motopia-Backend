const mongoose = require("mongoose");
const { Schema } = mongoose;

const vehicleLimitSchema = new Schema(
  {
    vehicleLimit: Number
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const VehicleLimit = mongoose.model("vehicleLimit", vehicleLimitSchema);

module.exports = VehicleLimit;

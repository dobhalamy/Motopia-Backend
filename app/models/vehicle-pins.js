const mongoose = require("mongoose");
const { Schema } = mongoose;

const vehiclePinSchema = new Schema({
  areas: [
    {
      _id: false,
      name: String,
      shape: { type: String, default: "circle" },
      coords: [Number]
    }
  ],
  description: [
    {
      _id: false,
      id: String,
      title: String,
      description: String,
      type: {
        type: String,
        enum: ["DAMAGE", "FEATURE", "POSSIBLE FEATURE", "INSTALLED FEATURE"]
      }
    }
  ],
  stockId: String,
  picture: String
}, {
  versionKey: false
});
const VehiclePin = mongoose.model("Vehicle-Pin", vehiclePinSchema);

module.exports = VehiclePin;

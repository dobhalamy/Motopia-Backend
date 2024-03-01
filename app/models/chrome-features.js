const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChromeSchema = new Schema({
  styleId: {
    type: Number,
    index: true,
    unique: true
  },
  style: {
    drivetrain: String,
  },
  engine: {
    engineType: String,
    fuelType: String,
    horsepower: {
        value: String,
        rpm: String
    },
    netTorque: {
        value: String,
        rpm: String
    },
    cylinders: Number,
    liters: String,
    batteryRange: Number,
    fuelEconomy: {
        city: {
            low: String,
            high: String,
        },
        hwy: {
            low: String,
            high: String,
        }
    },
    fuelCapacity: {
        unit: String,
        low: String,
        high: String,
    }
  },
  standard: [Object]
}, {
  versionKey: false
});

const Chrome = mongoose.model("chrome-feature", ChromeSchema);
module.exports = Chrome;

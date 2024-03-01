const mongoose = require("mongoose");
const { Schema } = mongoose;

const financePinSchema = new Schema({
  number: {
    type: Number,
    required: [true, "Miss Finance pin Number"]
  },
  page: {
    type: String,
    required: [true, "Miss Finance pin page"]
  },
  description: {
    type: String,
    required: [true, "Miss Finance pin description"]
  }
}, {
  versionKey: false
});

const FinancePin = mongoose.model("Finance-Pin", financePinSchema);

module.exports = FinancePin;

const mongoose = require("mongoose");
const { Schema } = mongoose;

const vectorImageSchema = new Schema({
  stockId: {
    type: String,
    required: [true, "Miss Stock ID for saving SVG"],
    trim: true
  },
  img: {
    publicId: String,
    src: {
      type: String,
      required: [true, "Miss Dealer's logo src"]
    }
  },
  main: {
    type: Boolean,
    default: true
  }
}, {
  versionKey: false
});

const VectorImage = mongoose.model("Car-Vector-Image", vectorImageSchema);

module.exports = VectorImage;

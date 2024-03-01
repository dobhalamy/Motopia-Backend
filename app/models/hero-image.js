const mongoose = require("mongoose");
const { Schema } = mongoose;

const heroImageSchema = new Schema({
  title: {
    type: String
  },
  text: {
    type: String
  },
  visible: {
    type: Boolean,
    default: false
  },
  img: {
    publicId: String,
    src: {
      type: String,
      required: true
    }
  },
  mobileImg: {
    publicId: String,
    mobileSrc: {
      type: String,
      required: true
    }
  },
  linkPath: {
    type: String
  },
}, {
  versionKey: false
});

const HeroImage = mongoose.model("hero-image", heroImageSchema);

module.exports = HeroImage;

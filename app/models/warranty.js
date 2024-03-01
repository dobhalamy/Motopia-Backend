const mongoose = require("mongoose");
const { Schema } = mongoose;

const warrantyImageSchema = new Schema({
  title: {
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
}, {
  versionKey: false
});

const WarrantyImage = mongoose.model("warranty-image", warrantyImageSchema);

module.exports = WarrantyImage;

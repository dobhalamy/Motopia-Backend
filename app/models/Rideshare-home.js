const mongoose = require('mongoose');
const { Schema } = mongoose;

const rideShareHome = new Schema(
  {
    title: {
      type: String,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    img: {
      publicId: String,
      src: {
        type: String,
        required: true,
      },
    },
    mobileImg: {
      publicId: String,
      mobileSrc: {
        type: String,
        required: true,
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const rideshareHome = mongoose.model('ride-share-home', rideShareHome);

module.exports = rideshareHome;

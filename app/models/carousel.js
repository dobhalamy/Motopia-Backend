const mongoose = require("mongoose");
const { Schema } = mongoose;

const carouselSchema = new Schema({
  title: {
    required: true,
    type: String,
  },
  description: String,
  image: {
    src: String,
    publicId: String,
  },
  mobileImage: {
    src: String,
    publicId: String
  },
  subCategories: [
    {
      title: {
        required: true,
        type: String,
      },
      description: String,
      logoImage: {
        src: String,
        publicId: String
      },
      link: String,
    },
  ],
});

const carousel = mongoose.model("carousel", carouselSchema);

module.exports = carousel;

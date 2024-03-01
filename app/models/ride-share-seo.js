const mongoose = require('mongoose');
const { Schema } = mongoose;

const rideShareSeoSchema = new Schema(
  {
    cityName: {
      type: String,
      required: [true, 'Miss City Name'],
    },
    workState: {
      type: String,
      required: [true, 'Miss Work State'],
    },
    plateType: {
      type: String,
      required: [true, 'Miss Plate Type'],
    },
    zone: {
      type: [String],
      required: [true, 'Miss Zones'],
    },
    canonical: {
      type: String,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    seoTags: {
      type: Object,
    },
    active: {
      type: Boolean,
      default: false,
    },
    citySpecificText: String,
    textColor: String,
    img: {
      src: String,
      publicId: String,
    },
    url: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const RideShareSeo = mongoose.model('Ride-share-seo', rideShareSeoSchema);

module.exports = RideShareSeo;

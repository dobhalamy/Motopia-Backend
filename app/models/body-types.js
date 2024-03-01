const mongoose = require('mongoose');
const { Schema } = mongoose;

const BodyTypeSchema = new Schema(
  {
    carBody: String,
    dmsBodyValues: [String],
    position: Number,
    isCampaignActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const BodyType = mongoose.model('Body-type', BodyTypeSchema);
module.exports = BodyType;

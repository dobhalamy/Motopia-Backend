const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdCampaignSchema = new Schema(
  {
    inventoryThreshold: Number,
    notificationEmail: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const AdCampaign = mongoose.model('ad-campaign', AdCampaignSchema);
module.exports = AdCampaign;

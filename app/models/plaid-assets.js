const mongoose = require('mongoose');
const { Schema } = mongoose;

const plaidAssets = new Schema(
  {
    assetReportId: {
      type: String,
      default: null,
      required: true,
    },
    assetReportToken: { type: String, default: null },
    webhookCode: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const PlaidAssets = mongoose.model('plaid-assets', plaidAssets);

module.exports = PlaidAssets;

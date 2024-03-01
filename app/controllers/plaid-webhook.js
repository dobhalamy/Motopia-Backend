const PlaidAssets = require('../models/plaid-assets');

exports.plaidWebhook = async (req, res, next) => {
  const { asset_report_id } = req.body;
  const { webhook_code } = req.body;

  await PlaidAssets.findOneAndUpdate(
    { assetReportId: asset_report_id },
    { webhookCode: webhook_code }
  );

  res.status(200).send('Webhook received successfully'); // Respond to the webhook request
};

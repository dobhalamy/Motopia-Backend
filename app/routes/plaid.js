const express = require('express');
const router = express.Router();
const {
  createLinkToken,
  exchangePublicToken,
  createAssetReport,
  getAssetReport,
} = require('../controllers/plaid');
const { plaidWebhook } = require('../controllers/plaid-webhook');

router.get('/create-token', createLinkToken);
router.post('/exchange-token', exchangePublicToken);
router.post('/create-asset-report', createAssetReport);
router.post('/get-asset-report', getAssetReport);
router.post('/plaid-webhook', plaidWebhook);

module.exports = router;

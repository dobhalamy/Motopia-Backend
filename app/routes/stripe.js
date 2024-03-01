const express = require('express');
const router = express.Router();
const { createCheckout, webhook, paymentRequset } = require('../controllers/stripe');

router.post('/checkout', createCheckout);
router.post('/intent', paymentRequset);
router.post('/webhook', webhook);

module.exports = router;

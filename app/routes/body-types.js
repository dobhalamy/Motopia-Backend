const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getAllBody, createBodyCards, getAvailableTypes } = require('../controllers/body-types');

router.get('/', passport.authenticate("jwt", { session: false }), getAllBody);
router.get('/available', passport.authenticate("jwt", { session: false }), getAvailableTypes);
router.post('/', passport.authenticate("jwt", { session: false }), createBodyCards);

module.exports = router;
const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  getInventoryThreshold,
  updateInventoryThreshold,
} = require('../controllers/ad-campaign');

/**
 * @swagger
 * /finance-pins:
 *   get:
 *     description: Inventory threshold data
 *     tags:
 *       - Inventory threshold
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Inventory threshold
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get inventory threshold data
 *       401:
 *         description: User is unauthorized.
 */
router.get('/', getInventoryThreshold);

/**
 * @swagger
 * /finance-pins:
 *   post:
 *     description: Create Inventory threshold data
 *     tags:
 *       - Inventory threshold
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Inventory-threshold'
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  updateInventoryThreshold
);

module.exports = router;

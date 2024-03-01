const express = require("express");
const router = express.Router();
const { createSavings } = require('../controllers/saving-payments');
const { checkProspect } = require('../middlewares/request');

/**
 * @swagger
 * /dm-payment:
 *   post:
 *     description: Create promo block at database
 *     tags:
 *       - Saving down & monthly payment
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Saving down & monthly payment'
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: No Prospect or Stock IDS
 */
router.post("/", checkProspect, createSavings);

module.exports = router;
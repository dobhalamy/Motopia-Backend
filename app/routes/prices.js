const router = require('express').Router();
const passport = require("passport");
const { getPrice, setPrice } = require('../controllers/prices');

/**
 * @swagger
 * /prices:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get the price list ()
 *     tags:
 *       - Prices
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       500:
 *         description: There is no saved amounts for this user
 */
router.get('/', getPrice);

/**
 * @swagger
 * /prices:
 *   post:
 *     description: Set the prices for gomotopia.com
 *     tags:
 *       - Prices
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *          _id:
 *            type: string
 *          lockDown:
 *            type: string
 *            required: true
 *          downPayment:
 *            type: string
 *            required: true
 *          retailDeposit:
 *            type: string
 *            format: int64
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: User is unauthorized.
 */
router.post('/', passport.authenticate("jwt", { session: false }), setPrice);

module.exports = router;
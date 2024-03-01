const router = require('express').Router();
const passport = require("passport");
const { getDelivery, setDelivery } = require('../controllers/delivery');

/**
 * @swagger
 * /delivery:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get the delivery setting data
 *     tags:
 *       - Delivery
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       500:
 *         description: There is no data for delivery settings
 */
router.get('/', getDelivery);

/**
 * @swagger
 * /delivery:
 *   post:
 *     description: Set the delivery for gomotopia.com
 *     tags:
 *       - Delivery
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
 *          deliveryMiles:
 *            type: string
 *            required: true
 *          deliveryDays:
 *            type: string
 *            required: true
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
router.post('/', passport.authenticate("jwt", { session: false }), setDelivery);

module.exports = router;
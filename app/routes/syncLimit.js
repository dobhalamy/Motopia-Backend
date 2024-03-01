const router = require('express').Router();
const passport = require("passport");
const { setVehicleLimit, getVehicleLimit } = require("../controllers/vehicles");

/**
 * @swagger
 * /syncLimit:
 *   get:
 *     description: Get the vehicle sync limit
 *     tags:
 *       - SyncLimit
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       500:
 *         description: There is no data for delivery settings
 */
 router.get('/', passport.authenticate("jwt", { session: false }), getVehicleLimit);

/**
 * @swagger
 * /syncLimit:
 *   post:
 *     description: Set the vehicle sync limit for gomotopia.com
 *     tags:
 *       - SyncLimit
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
 *          vehicleLimit:
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
 router.post('', passport.authenticate("jwt", { session: false }), setVehicleLimit);

module.exports = router;
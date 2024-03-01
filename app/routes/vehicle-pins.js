const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  pinsList,
  pinsListByStockId,
  createVehiclePin,
  // addNewPinsToStockId,
  updateVehiclePin,
  deleteVehiclePin
  // removeSomePin
} = require("../controllers/vehicle-pins");

const preSavePin = require("../middlewares/preSavePin");

/**
 * @swagger
 * /vehicle-pins:
 *   get:
 *     description: Vehicle pins list
 *     tags:
 *       - Vehicle pins
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vehicle pins list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get vehicle pins list
 *       401:
 *         description: User is unauthorized.
 */
router.get("/", passport.authenticate("jwt", { session: false }), pinsList);

/**
 * @swagger
 * /vehicle-pins/{stockId}:
 *   get:
 *     description: Vehicle pins list
 *     tags:
 *       - Vehicle pins
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Vehicle pins list
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicle pins list
 *       401:
 *         description: User is unauthorized.
 */
router.get("/:stockId", pinsListByStockId);

/**
 * @swagger
 * /vehicle-pins:
 *   post:
 *     description: Create vehicle pin. Picture - is vehicle's picture._id
 *     tags:
 *       - Vehicle pins
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Vehicle-pins'
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
  "/",
  passport.authenticate("jwt", { session: false }),
  preSavePin,
  createVehiclePin
);

// /**
//  * @swagger
//  * /vehicle-pins/{stockId}:
//  *   put:
//  *     description: Add some new pins (area & desc) to Car
//  *     security:
//  *       - ApiKeyAuth: []
//  *     tags:
//  *       - Vehicle pins
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *     - in: body
//  *       name: body
//  *       required: true
//  *       schema:
//  *         $ref: '#/definitions/Vehicle-pins'
//  *     - in: path
//  *       name: id
//  *       required: true
//  *       type: string
//  *     responses:
//  *       200:
//  *         description: Success
//  *         schema:
//  *           $ref: '#/definitions/Success'
//  *       401:
//  *         description: User is unauthorized.
//  *       404:
//  *         description: Vehicle pin not found
//  */
// router.put(
//   "/:stockId",
//   passport.authenticate("jwt", { session: false }),
//   preSavePin,
//   addNewPinsToStockId
// );

/**
 * @swagger
 * /vehicle-pins:
 *   patch:
 *     description: Update vehicle pin by ID. Picture - is vehicle's picture.name
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Vehicle pins
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Vehicle-pins'
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: Vehicle pin not found
 */
router.patch(
  "/",
  passport.authenticate("jwt", { session: false }),
  updateVehiclePin
);

/**
 * @swagger
 * /vehicle-pins/{stockId}/{picture}:
 *   delete:
 *     description: Delete vehicle pin by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Vehicle pins
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         type: string
 *       - in: path
 *         name: picture
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description:  Vehicle pin not found
 */
router.delete(
  "/:stockId/:picture",
  passport.authenticate("jwt", { session: false }),
  deleteVehiclePin
);

// /**
//  * @swagger
//  * /vehicle-pins/{stockId}/{name}:
//  *   delete:
//  *     description: Delete some pin by its name
//  *     security:
//  *       - ApiKeyAuth: []
//  *     tags:
//  *       - Vehicle pins
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         type: string
//  *       - in: path
//  *         name: name
//  *         required: true
//  *         type: string
//  *     responses:
//  *       200:
//  *         description: Success
//  *         schema:
//  *           $ref: '#/definitions/Success'
//  *       401:
//  *         description: User is unauthorized.
//  *       404:
//  *         description:  Vehicle pin not found
//  */
// router.delete(
//   "/:stockId/:name",
//   passport.authenticate("jwt", { session: false }),
//   removeSomePin
// );
module.exports = router;

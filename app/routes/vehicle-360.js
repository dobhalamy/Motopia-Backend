const express = require("express");
const router = express.Router();
const passport = require("passport");
const { getVehicle360List, getVehicle360, getXMLFileForStockId, updateHotSpots, deleteHotspotById } = require('../controllers/vehicle-360');

/**
 * @swagger
 * /web360/vehicles:
 *   get:
 *     description: List of 360 configurations
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Web 360 vehicle
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vehicles list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get vehicles list
 *       401:
 *         description: User is unauthorized.
 */
router.get("/vehicles", passport.authenticate("jwt", { session: false }), getVehicle360List);

/**
 * @swagger
 * /web360/vehicles/{stockid}:
 *   get:
 *     description: Vehicle specify 360 configuration
 *     tags:
 *       - Web 360 vehicle
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Vehicle specify 360 configuration
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicle
 */
router.get("/vehicles/:stockid", getVehicle360);

/**
 * @swagger
 * /web360/{stockid}:
 *   get:
 *     description: Vehicle specify 360 xml file
 *     tags:
 *       - Web 360 vehicle
 *     produces:
 *       - text/xml
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Vehicle specify 360 xml file
 *       400:
 *         description: Can't get vehicle
 */
router.get("/:stockid", getXMLFileForStockId);


/**
 * @swagger
 * /web360/hotspot:
 *   post:
 *     description: Create or update hotspots
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Web 360 vehicle
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             stockid:
 *               type: string
 *               required: true
 *             hotspots:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Hotspot'
 *                 
 *     responses:
 *       200:
 *         description: Vehicle specify 360 xml file
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't get vehicle
 */
router.post("/hotspot", passport.authenticate("jwt", { session: false }), updateHotSpots);


/**
 * @swagger
 * /web360/hotspot/{stockid}/{currentView}/{hotspotid}:
 *   delete:
 *     description: Remove hotspot from vehicle 360
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Web 360 vehicle
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *       - in: path
 *         name: currentView
 *         required: true
 *         type: string
 *       - in: path
 *         name: hotspotid
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Vehicle specify 360 xml file
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't get vehicle
 */
router.delete("/hotspot/:stockid/:currentView/:hotspotid", passport.authenticate("jwt", { session: false }), deleteHotspotById);


module.exports = router;

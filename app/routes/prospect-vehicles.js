const express = require("express");
const router = express.Router();
const { getProspectVehicles } = require('../controllers/prospect-vehicles');

/**
 * @swagger
 * /prospect-vehicles/{prospectId}:
 *   get:
 *     description: Prospect vehicle list
 *     tags:
 *       - Prospect's vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: prospectId
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Prospect vehicles list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 */
router.get('/:prospectId', getProspectVehicles);

module.exports = router;
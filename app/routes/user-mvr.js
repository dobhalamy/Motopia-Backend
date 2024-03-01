const express = require("express");
const router = express.Router();
const { getReport, saveReport } = require("../controllers/user-mvr");

/**
 * @swagger
 * /mvr/{id}:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get saved report for user
 *     tags:
 *       - MVR
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: report
 *         schema:
 *           $ref: '#/definitions/MVR'
 */
router.get("/:id", getReport);

/**
 * @swagger
 * /mvr:
 *   post:
 *     summary: PUBLIC ROUTE
 *     description: Save report for user
 *     tags:
 *       - MVR
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Save-report'
 *     responses:
 *       200:
 *         description: report
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Something wrong
 */
router.post("/", saveReport);

module.exports = router;

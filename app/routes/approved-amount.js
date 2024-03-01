const express = require("express");
const router = express.Router();
const { getAmountById, saveAmount } = require("../controllers/approved-amount");

/**
 * @swagger
 * /amount/{id}:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get saved amount for user
 *     tags:
 *       - Approved amount
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Approved-amount'
 *       404:
 *         description: There is no saved amounts for this user
 */
router.get("/:id", getAmountById);

/**
 * @swagger
 * /amount:
 *   post:
 *     summary: PUBLIC ROUTE
 *     description: Save amount for user
 *     tags:
 *       - Approved amount
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Save-amount'
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Success'
 *       419:
 *         description: Error for saving
 *       401:
 *         description: Unauthorized
 */
router.post("/", saveAmount);

module.exports = router;

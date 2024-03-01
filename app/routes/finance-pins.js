const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  pinsList,
  createFinPin,
  updateFinPin,
  deleteFinPin
} = require("../controllers/finance-pins");

/**
 * @swagger
 * /finance-pins:
 *   get:
 *     description: Finance pins list
 *     tags:
 *       - Finance pins
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Finance pins list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get finance pins list
 *       401:
 *         description: User is unauthorized.
 */
router.get("/", pinsList);

/**
 * @swagger
 * /finance-pins:
 *   post:
 *     description: Create finance pin
 *     tags:
 *       - Finance pins
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Finance-pins'
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
  createFinPin
);

/**
 * @swagger
 * /finance-pins/{id}:
 *   patch:
 *     description: Update finance pin by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Finance pins
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Finance-pins'
 *     - in: path
 *       name: id
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: Finance pin not found
 */
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateFinPin
);

/**
 * @swagger
 * /finance-pins/{id}:
 *   delete:
 *     description: Delete finance pin by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Finance pins
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description:  Finance pin not found
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteFinPin
);

module.exports = router;

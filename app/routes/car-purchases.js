const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  carPurchaseList,
  carPurchaseUnreviewedList,
  createCarPurchase,
  updateCarPurchase,
  deleteCarPurchase
} = require("../controllers/car-purchases");

const firstLetterCap = require("../middlewares/firstletter-cap");

/**
 * @swagger
 * /car-purchases:
 *   get:
 *     description: Car Purchase Requests list
 *     tags:
 *       - Car purchase
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Promo blocks list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no purchases at database
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  carPurchaseList
);

/**
 * @swagger
 * /car-purchases/primary:
 *   get:
 *     description: Unreviewed Car Purchase Requests list
 *     tags:
 *       - Car purchase
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Unreviewed Car purchases list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get unreviewed purchases list
 *       401:
 *         description: User is unauthorized.
 */
router.get(
  "/primary",
  passport.authenticate("jwt", { session: false }),
  carPurchaseUnreviewedList
);

/**
 * @swagger
 * /car-purchases:
 *   post:
 *     summary: PUBLIC ROUTE
 *     description: Save Car Purchase Request to DB
 *     tags:
 *       - Car purchase
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Car-purchase'
 *       value:
 *         firstName: John
 *         middleName: User
 *         lastName: Middleware
 *         email: user1@test.com
 *         phone: +380112223344
 *         downPayment: 5000
 *         perMonthPayment: 200.1
 *         monthPeriod: 12
 *         bank: IdeaBank
 *         stockId: 12358
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Error
 */
router.post("/", firstLetterCap, createCarPurchase);

/**
 * @swagger
 * /car-purchases/{id}:
 *   patch:
 *     description: Update the purchase object with reviewed -> TRUE by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Car purchase
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
 *       419:
 *         description: Error with update
 */
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateCarPurchase
);

/**
 * @swagger
 * /car-purchases/{id}:
 *   delete:
 *     description: Delete the purchase object by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Car purchase
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
 *       419:
 *         description: Error wih delete
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteCarPurchase
);

module.exports = router;

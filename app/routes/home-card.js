const router = require("express").Router();
const passport = require("passport");

const { getCards, createCards } = require("../controllers/home-card");

/**
 * @swagger
 * /cards:
 *   get:
 *     description: Cards list
 *     tags:
 *       - Home cards
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: No vector images at database
 *       419:
 *         description: Error
 */
router.get("/", getCards);

/**
 * @swagger
 * /cards:
 *   post:
 *     description: Create / update card list
 *     tags:
 *       - Home cards
 *     produces:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *              cards:
 *                 type: array
 *                 items:
 *                    $ref: '#/definitions/Home-card'
 *     responses:
 *       200:
 *         description: Cards list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: No vector images at database
 *       419:
 *         description: Error
 */
router.post("/", passport.authenticate("jwt", { session: false }), createCards);

module.exports = router;

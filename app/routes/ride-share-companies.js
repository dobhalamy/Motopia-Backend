const router = require("express").Router();
const passport = require('passport');

const { rdsComapniesLinst, deleteRdsCompany, createRdsCompany, updateRdsCompany } = require("../controllers/ride-share-companies");

/**
 * @swagger
 * /ride-share-companies:
 *   get:
 *     description: Ride Share Companies list
 *     tags:
 *       - Ride Share Companies
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ride Share list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       404:
 *         description: There is no Ride Share Companies at database
 */
router.get("/", rdsComapniesLinst);

/**
 * @swagger
 * /ride-share-companies:
 *   post:
 *     description: Create ride share company at database
 *     tags:
 *       - Ride Share Companies
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *          name:
 *            type: string
 *            required: true
 *          isActive:
 *            type: boolean
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't create
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post(
  "/",
  passport.authenticate('jwt', { session: false }),
  createRdsCompany
);

/**
 * @swagger
 * /ride-share-companies/{id}:
 *   delete:
 *     description: Delete the Ride Share Company object by ID
 *     tags:
 *       - Ride Share Companies
 *     produces:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []
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
 *         description: Ride Share Company is unauthorized.
 *       419:
 *         description: Error wih delete
 */
router.delete("/:id", passport.authenticate('jwt', { session: false }), deleteRdsCompany);

/**
 * @swagger
 * /ride-share-seo/{id}:
 *   put:
 *     description: Update ride share Company in database
 *     tags:
 *       - Ride Share Companies
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *          name:
 *            type: string
 *          isActive:
 *            type: boolean
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't update
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.put(
  "/:id",
  passport.authenticate('jwt', { session: false }),
  updateRdsCompany,
);

module.exports = router;

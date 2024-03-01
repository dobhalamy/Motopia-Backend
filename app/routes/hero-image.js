const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  heroList,
  visibleList,
  createHero,
  updateHero,
  deleteHero
} = require("../controllers/hero-image");

/**
 * @swagger
 * /hero:
 *   get:
 *     description: Hero images list
 *     tags:
 *       - Hero images
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Hero images list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no Hero images at database
 */
router.get("/", passport.authenticate("jwt", { session: false }), heroList);

/**
 * @swagger
 * /hero/primary:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Visible Hero images list
 *     tags:
 *       - Hero images
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Visible Hero images list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no Hero images at database
 */
router.get("/primary", visibleList);

/**
 * @swagger
 * /hero:
 *   post:
 *     description: Create promo block at database
 *     tags:
 *       - Hero images
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: formData
 *       name: title
 *       type: string
 *     - in: formData
 *       name: text
 *       type: string
 *     - in: formData
 *       name: visible
 *       type: boolean
 *     - in: formData
 *       name: img
 *       type: file
 *     - in: formData
 *       name: linkPath
 *       type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't create promo
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createHero
);

/**
 * @swagger
 * /hero/{id}:
 *   patch:
 *     description: Create promo block at database
 *     tags:
 *       - Hero images
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       type: string
 *     - in: formData
 *       name: title
 *       type: string
 *     - in: formData
 *       name: text
 *       type: string
 *     - in: formData
 *       name: visible
 *       type: boolean
 *     - in: formData
 *       name: img
 *       type: file
 *     - in: formData
 *       name: linkPath
 *       type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't create promo
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: Block is not found.
 *       419:
 *         description: Error
 */
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateHero
);

/**
 * @swagger
 * /hero/{id}:
 *   delete:
 *     description: Delete promo block by id
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Hero images
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
 *         description: Block is not found.
 *       419:
 *         description: Error
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteHero
);

module.exports = router;

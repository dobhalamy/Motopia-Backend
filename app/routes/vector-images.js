const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  svgList,
  svgListByStockId,
  saveSvg,
  updateSvg,
  deleteSvg
} = require("../controllers/vector-images");

const preSaveImage = require("../middlewares/pre-save-svg");
const preImage = require("../validation/pre-image");

/**
 * @swagger
 * /svg:
 *   get:
 *     description: Vector images list
 *     tags:
 *       - Vector images
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vector images list
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
router.get("/", passport.authenticate("jwt", { session: false }), svgList);

/**
 * @swagger
 * /svg/{stockId}:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Vector images list by stockId
 *     tags:
 *       - Vector images
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockId
 *         required: true
 *         type: string
 *         value: audi
 *     responses:
 *       200:
 *         description: Visible vector images list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: No vector images for this stockId at database
 *       419:
 *         description: Error
 */
router.get("/:stockId", svgListByStockId);

/**
 * @swagger
 * /svg:
 *   post:
 *     description: Save image to DB
 *     tags:
 *       - Vector images
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: formData
 *       name: stockId
 *       type: string
 *       required: true
 *     - in: formData
 *       name: img
 *       type: file
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: There are already present 2 images for this stockId
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  preSaveImage.single("img"),
  preImage,
  saveSvg
);

/**
 * @swagger
 * /svg/{id}:
 *   patch:
 *     summary: Update main status of image
 *     description: Update main status of image
 *     tags:
 *       - Vector images
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
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateSvg
);

/**
 * @swagger
 * /svg/{id}:
 *   delete:
 *     description: Delete image by id
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Vector images
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
 *         description: Image is not found.
 *       419:
 *         description: Error
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteSvg
);

module.exports = router;

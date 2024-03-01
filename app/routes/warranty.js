const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
    warrantyList,
    visibleList,
    createWarranty,
    updateWarranty,
    deleteWarranty
} = require("../controllers/warranty-image");

/**
 * @swagger
 * /warranty:
 *   get:
 *     description: warranty images list
 *     tags:
 *       - warranty images
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: warranty images list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no warranty images at database
 */
router.get("/", warrantyList);

/**
 * @swagger
 * /warranty/primary:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Visible warranty images list
 *     tags:
 *       - warranty images
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Visible warranty images list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no warranty images at database
 */
router.get("/primary", visibleList);

/**
 * @swagger
 * /warranty:
 *   post:
 *     description: Create promo block at database
 *     tags:
 *       - warranty images
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
 *       name: visible
 *       type: boolean
 *     - in: formData
 *       name: img
 *       type: file
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
  createWarranty
);

/**
 * @swagger
 * /warranty/{id}:
 *   patch:
 *     description: Create promo block at database
 *     tags:
 *       - warranty images
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
  updateWarranty
);

/**
 * @swagger
 * /warranty/{id}:
 *   delete:
 *     description: Delete promo block by id
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - warranty images
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
  deleteWarranty
);

module.exports = router;

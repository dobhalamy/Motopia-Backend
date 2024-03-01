const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  dealerInfo,
  createDealerInfo,
  updateDealerInfo,
  deleteDealerInfo
} = require("../controllers/dealer-info");

const preSaveImage = require("../middlewares/pre-save-svg");

const preImage = require("../validation/pre-image");
const dealerHeadersValidator = require("../validation/dealer-info-validation");
/**
 * @swagger
 * /dealer-info:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get saved amount for user
 *     tags:
 *       - Dealer info
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: dealer
 *         schema:
 *           $ref: '#/definitions/Dealer-info'
 *       404:
 *         description: There is no saved amounts for this user
 */
router.get("/", dealerInfo);

/**
 * @swagger
 * /dealer-info:
 *   post:
 *     description: Create Dealer info data at database
 *     tags:
 *       - Dealer info
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: formData
 *       name: name
 *       type: string
 *       required: true
 *     - in: formData
 *       name: phone
 *       type: string
 *       required: true
 *     - in: formData
 *       name: address
 *       type: string
 *       required: true
 *     - in: formData
 *       name: logo
 *       type: file
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: There are already present Dealer's contact information
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  preSaveImage.single("logo"),
  preImage,
  dealerHeadersValidator,
  createDealerInfo
);

/**
 * @swagger
 * /dealer-info/{id}:
 *   patch:
 *     description: Update the purchase object with reviewed -> TRUE by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Dealer info
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: name
 *         type: string
 *       - in: formData
 *         name: phone
 *         type: string
 *       - in: formData
 *         name: address
 *         type: string
 *       - in: formData
 *         name: logo
 *         type: file
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error with update
 */
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  preSaveImage.single("logo"),
  preImage,
  dealerHeadersValidator,
  updateDealerInfo
);

/**
 * @swagger
 * /dealer-info/{id}:
 *   delete:
 *     description: Delete dealer info
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Dealer info
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
 *         description: There is no dealer's info with such id
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteDealerInfo
);
module.exports = router;

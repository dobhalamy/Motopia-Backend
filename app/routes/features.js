const express = require("express");
const router = express.Router();
const passport = require("passport");
const { updateFeature } = require("../controllers/features");

/**
 * @swagger
 * /features:
 *   put:
 *     description: Create promo block at database
 *     tags:
 *       - Features
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              stockid: 
 *                type: integer
 *                format: int64
 *              installedPossibleFeatures:
 *                type: array
 *                items:
 *                   type: object
 *                   properties:
 *                     featureId:
 *                       type: integer
 *                       format: int64
 *                     featureName:
 *                       type: string
 *                     featureDesc:
 *                       type: string
 *              possibleFeatures:
 *                type: array
 *                items:
 *                   type: object
 *                   properties:
 *                     featureId:
 *                       type: integer
 *                       format: int64
 *                     featureName:
 *                       type: string
 *                     featureDesc:
 *                       type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.put('/', passport.authenticate("jwt", { session: false }), updateFeature);

module.exports = router;
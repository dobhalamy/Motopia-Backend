const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  promoList,
  visibleList,
  createPromo,
  updatePromo,
  deletePromo,
} = require('../controllers/promo');

/**
 * @swagger
 * /promo:
 *   get:
 *     description: Promo blocks list
 *     tags:
 *       - Promo blocks
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
 *         description: There is no promo blocks at database
 */
router.get('/', passport.authenticate('jwt', { session: false }), promoList);

/**
 * @swagger
 * /promo/primary:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Visible promo blocks list
 *     tags:
 *       - Promo blocks
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Visible promo blocks list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no promo blocks at database
 */
router.get('/primary', visibleList);

/**
 * @swagger
 * /promo:
 *   post:
 *     description: Create promo block at database
 *     tags:
 *       - Promo blocks
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
 *       name: position
 *       type: integer
 *       format: int64
 *     - in: formData
 *       name: visible
 *       type: boolean
 *     - in: formData
 *       name: img
 *       type: file
 *     - in: formData
 *       name: linkText
 *       type: string
 *     - in: formData
 *       name: linkPath
 *       type: string
 *     - in: formData
 *       name: linkColor
 *       type: string
 *       value: '#000000'
 *     - in: formData
 *       name: background
 *       type: string
 *       value: '#000000'
 *     - in: formData
 *       name: textColor
 *       type: string
 *       value: '#000000'
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
  '/',
  passport.authenticate('jwt', { session: false }),
  createPromo
);

/**
 * @swagger
 * /promo/{id}:
 *   patch:
 *     description: Create promo block at database
 *     tags:
 *       - Promo blocks
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
 *       name: position
 *       type: integer
 *       format: int64
 *     - in: formData
 *       name: visible
 *       type: boolean
 *     - in: formData
 *       name: img
 *       type: file
 *     - in: formData
 *       name: linkText
 *       type: string
 *     - in: formData
 *       name: linkPath
 *       type: string
 *     - in: formData
 *       name: linkColor
 *       type: string
 *       value: '#000000'
 *     - in: formData
 *       name: background
 *       type: string
 *       value: '#000000'
 *     - in: formData
 *       name: textColor
 *       type: string
 *       value: '#000000'
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
  '/:id',
  passport.authenticate('jwt', { session: false }),
  updatePromo
);

/**
 * @swagger
 * /promo/{id}:
 *   delete:
 *     description: Delete promo block by id
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Promo blocks
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
  '/:id',
  passport.authenticate('jwt', { session: false }),
  deletePromo
);

module.exports = router;

const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  rdsHomeList,
  createSingleRds,
  updateSingleRds,
  deleteSingleRds,
  randomRds,
} = require('../controllers/rideshare-home');

/**
 * @swagger
 * /rds-list:
 *   get:
 *     description: Ride share images and title
 *     tags:
 *       - Random ride share images and title
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ride share images and title
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no Ride share images at database
 */
router.get('/', passport.authenticate('jwt', { session: false }), rdsHomeList);

/**
 * @swagger
 * /random-content:
 *   get:
 *     description: Random ride share image and title
 *     tags:
 *       - Random ride Share images and title
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Random ride share image and title
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There is no Ride share images at database
 */
router.get('/random-content', randomRds);

/**
 * @swagger
 * /rds-list:
 *   post:
 *     description: Create promo block at database
 *     tags:
 *       - Random ride share images and title
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
 *         description: Can't create Ride Share images
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createSingleRds
);

/**
 * @swagger
 * /rds-list/{id}:
 *   patch:
 *     description: Create promo block at database
 *     tags:
 *       - Random ride share images and title
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
  updateSingleRds
);

/**
 * @swagger
 * /rds-list/{id}:
 *   delete:
 *     description: Delete Ride share image data by id
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Random ride share images and title
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
  deleteSingleRds
);

module.exports = router;

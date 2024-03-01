const router = require('express').Router();
const passport = require('passport');
const {
  seoList,
  rideShareSeoList,
  createRideShareSeo,
  deleteRideShareSeo,
  getRideShareSeoById,
  updateRideShareSeo,
  getRideShareSeoByStateCityAndPlate,
  deleteCityImage,
  getRDSLinks,
} = require('../controllers/ride-share-seo');

/**
 * @swagger
 * /ride-share-seo:
 *   get:
 *     description: Ride Share list
 *     tags:
 *       - Ride Share SEO
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ride Share list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: Ride Share SEO is unauthorized.
 *       404:
 *         description: There is no Ride Share SEO at database
 */
router.get('/', rideShareSeoList);
router.get('/seo-list', seoList);

/**
 * @swagger
 * /ride-share-seo/pages:
 *   get:
 *     description: Ride Share pages list
 *     tags:
 *       - Ride Share SEO
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ride Share pages list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: Ride Share SEO is unauthorized.
 *       404:
 *         description: There is no Ride Share SEO at database
 */
router.get('/pages', getRDSLinks);

/**
 * @swagger
 * /ride-share-seo:
 *   post:
 *     description: Create ride share SEO at database
 *     tags:
 *       - Ride Share SEO
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: formData
 *       name: cityName
 *       type: string
 *     - in: formData
 *       name: workState
 *       type: string
 *       required: true
 *     - in: formData
 *       name: plateType
 *       type: string
 *       required: true
 *     - in: formData
 *       name: zone
 *       type: array
 *       required: true
 *       items:
 *         type: string
 *         required: true
 *     - in: formData
 *       name: canonical
 *       type: string
 *       required: true
 *     - in: formData
 *       name: metaTitle
 *       type: string
 *       required: true
 *     - in: formData
 *       name: metaDescription
 *       type: string
 *       required: true
 *     - in: formData
 *       name: metaKeywords
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
 *         description: Can't create
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createRideShareSeo
);

/**
 * @swagger
 * /ride-share-seo/{id}:
 *   delete:
 *     description: Delete the Ride Share SEO object by ID
 *     tags:
 *       - Ride Share SEO
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
 *         description: Ride Share SEO is unauthorized.
 *       419:
 *         description: Error wih delete
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  deleteRideShareSeo
);

/**
 * @swagger
 * /ride-share-seo/byPlateAndState:
 *   get:
 *     description: returns ride share SEO from database
 *     tags:
 *       - Ride Share SEO
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: workState
 *         required: true
 *         type: string
 *       - in: query
 *         name: plateType
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       404:
 *         description: not found
 *       419:
 *         description: Error
 */
router.get('/byPlateAndState', getRideShareSeoByStateCityAndPlate);

/**
 * @swagger
 * /ride-share-seo/{id}:
 *   get:
 *     description: Get single Ride Share SEO
 *     tags:
 *       - Ride Share SEO
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Give the Ride Share SEO object
 *       404:
 *         description: There is no ride share at database with such id
 */
router.get('/:id', getRideShareSeoById);

/**
 * @swagger
 * /ride-share-seo/{id}:
 *   put:
 *     description: Delete ride share SEO at database
 *     tags:
 *       - Ride Share SEO
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
 *       name: cityName
 *       type: string
 *     - in: formData
 *       name: workState
 *       type: string
 *       required: true
 *     - in: formData
 *       name: plateType
 *       type: string
 *       required: true
 *     - in: formData
 *       name: zone
 *       type: array
 *       required: true
 *       items:
 *         type: string
 *         required: true
 *     - in: formData
 *       name: canonical
 *       type: string
 *       required: true
 *     - in: formData
 *       name: metaTitle
 *       type: string
 *       required: true
 *     - in: formData
 *       name: metaDescription
 *       type: string
 *       required: true
 *     - in: formData
 *       name: metaKeywords
 *       type: string
 *       required: true
 *     - in: formData
 *       name: backgroundImage
 *       type: file
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
  '/:id',
  passport.authenticate('jwt', { session: false }),
  updateRideShareSeo
);

/**
 * @swagger
 * /ride-share-seo/image/{id}:
 *   delete:
 *     description: Delete the image for Ride Share City
 *     tags:
 *       - Ride Share SEO
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
 *         description: Ride Share SEO is unauthorized.
 *       419:
 *         description: Error wih delete
 */
router.delete(
  '/image/:id',
  passport.authenticate('jwt', { session: false }),
  deleteCityImage
);

module.exports = router;

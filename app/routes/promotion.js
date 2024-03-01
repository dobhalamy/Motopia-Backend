const router = require('express').Router();
const passport = require('passport');
const {
  getRefererrs,
  createReferrer,
  getPartners,
  createPartner,
  updateParnter,
  deletePartner,
  checkPromoAndUpdateCustomer,
  getDisounts,
  setDisounts,
} = require('../controllers/promotion');

/**
 * @swagger
 * /promotion/discounts:
 *   get:
 *     description: Get the referral disounts
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Error
 */
router.get('/discounts',getDisounts);

/**
 * @swagger
 * /promotion/discounts:
 *   post:
 *     description: Set the referral disounts
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     consumes:
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
 *           saleDiscount:
 *             type: integer
 *           rentDiscount:
 *             type: integer
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Error
 */
router.post('/discounts',setDisounts);

/**
 * @swagger
 * /promotion/referrer:
 *   get:
 *     description: Get the referrers list
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 */
router.get(
  '/referrer',
  passport.authenticate('jwt', { session: false }),
  getRefererrs
);

/**
 * @swagger
 * /promotion/referrer:
 *   post:
 *     description: Create the referrer with promo-code
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           prospectId:
 *             type: integer
 *           state:
 *             type: string
 *           contactNumber:
 *             type: string
 *           promoCode:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Error
 */
router.post('/referrer', createReferrer);

/**
 * @swagger
 * /promotion/partner:
 *   get:
 *     description: Get the partners list
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 */
router.get(
  '/partner',
  passport.authenticate('jwt', { session: false }),
  getPartners
);

/**
 * @swagger
 * /promotion/partner:
 *   post:
 *     description: Create the partner
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     consumes:
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
 *           partnerSaleDiscount:
 *             type: integer
 *           partnerRentDiscount:
 *             type: integer
 *           name:
 *             type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       401:
 *         description: User is unauthorized.
 *       400:
 *         description: Error
 */
router.post(
  '/partner',
  passport.authenticate('jwt', { session: false }),
  createPartner
);

/**
 * @swagger
 * /promotion/partner/{id}:
 *   delete:
 *     description: Delete the partner
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     consumes:
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
 *         description: User is unauthorized.
 *       400:
 *         description: Error
 */
router.delete(
  '/partner/:id',
  passport.authenticate('jwt', { session: false }),
  deletePartner
);

/**
 * @swagger
 * /promotion/partner/{id}:
 *   patch:
 *     description: Update the partner
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             partnerSaleDiscount:
 *               type: integer
 *             partnerRentDiscount:
 *               type: integer
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       401:
 *         description: User is unauthorized.
 *       400:
 *         description: Error
 */
router.patch(
  '/partner/:id',
  passport.authenticate('jwt', { session: false }),
  updateParnter
);

/**
 * @swagger
 * /promotion/{promoCode}:
 *   post:
 *     description: Check the promo-code
 *     tags:
 *       - Promo Codes
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             prospectId:
 *               type: integer
 *             promoCode:
 *               type: integer
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Error
 */
router.post('/', checkPromoAndUpdateCustomer);

module.exports = router;

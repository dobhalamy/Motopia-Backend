const router = require("express").Router();

const {
    createCarouselSetting,
    carouselSettingList,
    updateCarouselSetting
} = require("../controllers/carousel-setting");

/**
 * @swagger
 * /carousel-settings:
 *   post:
 *     description: Create carousel setting at database
 *     tags:
 *       - Carousel Setting
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Can't create carousel setting
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: Error
 */
router.post("/", createCarouselSetting);

/**
 * @swagger
 * /carousel-settings:
 *   get:
 *     description: Carousel Setting list
 *     tags:
 *       - Carousel Setting
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Carousel Setting list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: Carousel Setting is unauthorized.
 *       404:
 *         description: There is no Carousel Setting at database
 */
router.get("/", carouselSettingList);

/**
 * @swagger
 * /carousel-settings:
 *   put:
 *     description: Update Carousel Setting
 *     tags:
 *       - Carousel Setting
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Update Carousel Setting
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: Carousel Setting is unauthorized.
 *       404:
 *         description: There is no Carousel Setting at database
 */
router.put("/", updateCarouselSetting);

module.exports = router;
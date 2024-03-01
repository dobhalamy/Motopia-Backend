const router = require("express").Router();
const passport = require("passport");
const {
  carouselList,
  createCarousel,
  deleteCarousel,
  getCarouselById,
  updateCarousel,
} = require("../controllers/carousel");

/**
 * @swagger
 * /carousel:
 *   get:
 *     description: Carousel list
 *     tags:
 *       - Carousel
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Carousel list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: Carousel is unauthorized.
 *       404:
 *         description: There is no carousel at database
 */
router.get("/", carouselList);

/**
 * @swagger
 * /carousel:
 *   post:
 *     description: Create carousel at database
 *     tags:
 *       - Carousel
 *     produces:
 *       - application/json
 *     consumes:
 *       - multipart/formdata
 *     parameters:
 *     - in: formData
 *       name: title
 *       type: string
 *     - in: formData
 *       name: description
 *       type: string
 *     - in: formData
 *       name: image
 *       type: string
 *     - in: query
 *       name: subCategories
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
router.post("/", passport.authenticate("jwt", { session: false }), createCarousel);

/**
 * @swagger
 * /carousel/{id}:
 *   delete:
 *     description: Delete the carousel object by ID
 *     tags:
 *       - Carousel
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
 *         description: Carousel is unauthorized.
 *       419:
 *         description: Error wih delete
 */
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteCarousel);

/**
 * @swagger
 * /carousel/{id}:
 *   get:
 *     description: Get single carousel
 *     tags:
 *       - Carousel
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Give the carousel object
 *         schema:
 *           $ref: '#/definitions/selected-carousel'
 *       404:
 *         description: There is no carousel at database
 */
router.get("/:id", getCarouselById);

// /**
//  * @swagger
//  * /carousel/{id}:
//  *   put:
//  *     description: Updating single carousel
//  *     tags:
//  *       - Carousel
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *     - in: body
//  *       name: body
//  *       required: true
//  *       schema:
//  *         $ref: '#/definitions/Carousel-update'
//  *     - in: path
//  *       name: id
//  *       required: true
//  *       type: string
//  *     responses:
//  *       200:
//  *         description: Success
//  *         schema:
//  *           $ref: '#/definitions/Success'
//  *       401:
//  *         description: carousel is unauthorized.
//  *       404:
//  *         description: Carousel not found
//  */
router.put("/:id", passport.authenticate("jwt", { session: false }), updateCarousel);

module.exports = router;

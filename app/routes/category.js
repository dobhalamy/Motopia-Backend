const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
    CategorysList,
    getDescriptionByCategory,
    updateCategory,
    createCategory,
    deleteCategory
} = require("../controllers/category");

/**
 * @swagger
 * /category/{selectedValue}:
 *   get:
 *     description: Categorys list
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Categorys list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get Categorys list
 *       401:
 *         description: User is unauthorized.
 */
router.get(
    "/:selectedValue",
    passport.authenticate("jwt", { session: false }),
    CategorysList
);

/**
 * @swagger
 * /category/getDesc/{selectedCategory}:
 *   get:
 *     description: Get rideShare category description
 *     tags:
 *       - Category
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: path
 *       name: selectedCategory
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: RideShare category description
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get Categorys list
 */
router.get(
    "/getDesc/:selectedCategory",
    getDescriptionByCategory
);

/**
 * @swagger
 * /category/updateCategory:
 *   post:
 *     description: Update an Category
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: make
 *       required: true
 *     - in: body
 *       name: model
 *       required: true
 *     - in: body
 *       name: seating
 *       required: true
 *     - in: body
 *       name: extColor
 *       required: true
 *     - in: body
 *       name: minYearAllowed
 *       required: true
 *     - in: body
 *       name: category
 *       required: true
 *     - in: body
 *       name: description
 *       required: true
 *     - in: body
 *       name: _id
 *       required: true
 *     - in: body
 *       name: createdAt
 *       required: true
 *     - in: body
 *       name: updatedAt
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: User is unauthorized.
 *       419:
 *         description: The user with such email already exist.
 *       500:
 *         description: Error with sending email. Probably daily limit is exceeded.
 */
router.post(
    "/update",
    passport.authenticate("jwt", { session: false }),
    updateCategory
);

/**
 * @swagger
 * /category/addCategory:
 *   post:
 *     description: Adds a new Category
 *     tags:
 *       - Category
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: make
 *       required: true
 *     - in: body
 *       name: model
 *       required: true
 *     - in: body
 *       name: seating
 *       required: true
 *     - in: body
 *       name: extColor
 *       required: true
 *     - in: body
 *       name: minYearAllowed
 *       required: true
 *     - in: body
 *       name: category
 *       required: true
 *     - in: body
 *       name: description
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Password is not match for requirements
 *       401:
 *         description: User is unauthorized.
 */
router.post(
    "/addCategory",
    passport.authenticate("jwt", { session: false }),
    createCategory
);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     description: Delete Category by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Category
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
 *         description: There is no Category with such id
 */
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    deleteCategory
);

module.exports = router;

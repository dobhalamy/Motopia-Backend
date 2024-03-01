const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
    lifeStyleCategorysList,
    updateLifeStyleCategory,
    createLifeStyleCategory,
    deleteLifeStyleCategory,
    getDescriptionByCategory
} = require("../controllers/lifeStyle");

/**
 * @swagger
 * /lifeStyle/{selectedValue}:
 *   get:
 *     description: lifeStyle Categorys list
 *     tags:
 *       - lifeStyle
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: lifeStyleCategorys list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get lifeStyleCategorys list
 *       401:
 *         description: User is unauthorized.
 */
router.get(
    "/:selectedValue",
    passport.authenticate("jwt", { session: false }),
    lifeStyleCategorysList
);

/**
 * @swagger
 * /lifeStyle/getDesc/{selectedCategory}:
 *   get:
 *     description: get description by lifeStyle Categorys
 *     tags:
 *       - lifeStyle
 *     parameters:
 *     - in: path
 *       name: selectedCategory
 *       required: true
 *       type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: lifeStyle description by category
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get lifeStyle description
 */
router.get(
    "/getDesc/:selectedCategory",getDescriptionByCategory
);

/**
 * @swagger
 * /lifeStyle/updatelifeStyleCategory:
 *   post:
 *     description: Update an lifeStyle Category description
 *     tags:
 *       - lifeStyle
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: category
 *       required: true
 *     - in: body
 *       name: description
 *       required: true
 *     - in: body
 *       name: __v
 *       required: true
 *     - in: body
 *       name: _id
 *       required: true
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: User is unauthorized.
 */
router.post(
    "/updatelifeStyleCategory",
    passport.authenticate("jwt", { session: false }),
    updateLifeStyleCategory
);

/**
 * @swagger
 * /lifeStyle/addlifeStyleCategory:
 *   post:
 *     description: Adds a new lifeStyleCategory
 *     tags:
 *       - lifeStyle
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
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
    "/addlifeStyleCategory",
    passport.authenticate("jwt", { session: false }),
    createLifeStyleCategory
);

/**
 * @swagger
 * /lifeStyle/{id}:
 *   delete:
 *     description: Delete lifeStyleCategory by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - lifeStyle
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
 *         description: There is no lifeStyleCategory with such id
 */
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    deleteLifeStyleCategory
);

module.exports = router;

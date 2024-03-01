const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  menuList,
  createMenu,
  updateMenu,
  deleteMenu
} = require("../controllers/menuItems");

/**
 * @swagger
 * /menuItems:
 *   get:
 *     description: Menu items list
 *     tags:
 *       - menuItems
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Menu items list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Error
 *       401:
 *         description: User is unauthorized.
 *       404:
 *         description: There are no menuItems present this time
 */
router.get("/", menuList);

/**
 * @swagger
 * /menuItems/createMenu:
 *   post:
 *     description: Adds a new menu item
 *     tags:
 *       - menuItems
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: title
 *       required: true
 *     - in: body
 *       name: linkPath
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
    "/createMenu",
    passport.authenticate("jwt", { session: false }),
    createMenu
);

/**
 * @swagger
 * /menuItems/updateMenuItem:
 *   post:
 *     description: Updates an menu item
 *     tags:
 *       - menuItems
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: title
 *       required: true
 *     - in: body
 *       name: linkpath
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
    "/updateMenuItem",
    passport.authenticate("jwt", { session: false }),
    updateMenu
);

/**
 * @swagger
 * /menuItems/{id}:
 *   delete:
 *     description: Delete menu item by id
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - menuItems
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
 *         description: menu item not found.
 *       419:
 *         description: Error
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteMenu
);

module.exports = router;

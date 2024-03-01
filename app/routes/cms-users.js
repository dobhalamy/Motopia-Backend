const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  adminsList,
  inviteAdmin,
  createAdmin,
  deleteAdmin
} = require("../controllers/users");

/**
 * @swagger
 * /users:
 *   get:
 *     description: Admins list
 *     tags:
 *       - Admin
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Admins list
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 *       400:
 *         description: Can't get admins list
 *       401:
 *         description: User is unauthorized.
 */
router.get("/", passport.authenticate("jwt", { session: false }), adminsList);

/**
 * @swagger
 * /users/invite:
 *   post:
 *     description: Invite admin by email
 *     tags:
 *       - Admin
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Invite-Admin'
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
  "/invite",
  passport.authenticate("jwt", { session: false }),
  inviteAdmin
);

/**
 * @swagger
 * /users/set-password:
 *   post:
 *     description: Set password after invite for new admin
 *     tags:
 *       - Admin
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/Password'
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
  "/set-password",
  passport.authenticate("jwt", { session: false }),
  createAdmin
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     description: Delete admin by ID
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Admin
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
 *         description: There is no admin with such id
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteAdmin
);

module.exports = router;

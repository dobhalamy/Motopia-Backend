const express = require("express");
const router = express.Router();
const passport = require("passport");
const { login, getUser } = require("../controllers/auth");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Login to the application
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Credentials'
 *         value: {email: test@test.com,password: Admin123}
 *     responses:
 *       200:
 *         description: login
 *         schema:
 *           $ref: '#/definitions/Login'
 *       404:
 *         description: User not found
 *       403:
 *         description: Wrong password or email
 */
router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  login
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     description: Get auth user info
 *     tags:
 *       - Auth
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vector images list
 *         schema:
 *           $ref: '#/definitions/Login'
 *       400:
 *         description: Error
 */
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getUser
);
module.exports = router;

const router = require("express").Router();
const passport = require('passport');
const { getAllLinks, getPostByURL, getListAndCategories, getActiveListAndCategories, deletePost, updatePost, createPost } = require("../controllers/blog-post");

/**
 * @swagger
 * /blog-posts/{category}/${post}:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get blog by link
 *     tags:
 *       - Blog
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 */
router.get("/:category/:post", getPostByURL);

/**
 * @swagger
 * /blog-posts:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get all blog related posts and categories
 *     tags:
 *       - Blog
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 */
 router.get("/", getListAndCategories);

/**
 * @swagger
 * /blog-posts/active:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get all active blog related posts and categories
 *     tags:
 *       - Blog
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 */
 router.get("/active", getActiveListAndCategories);

/**
 * @swagger
 * /blog-posts/links:
 *   get:
 *     summary: PUBLIC ROUTE
 *     description: Get all blog related links
 *     tags:
 *       - Blog
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: amount
 *         schema:
 *           $ref: '#/definitions/Success-arr'
 */
router.get("/links", getAllLinks);

/**
 * @swagger
 * /blog-posts:
 *   post:
 *     description: Create Blog Post in database
 *     tags:
 *       - Blog
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *          title:
 *            type: string
 *          url:
 *            type: string
 *          category:
 *            type: string
 *          html:
 *            type: string
 *          metaTitle:
 *            type: string
 *          metaDescription:
 *            type: string
 *          metaKeywords:
 *            type: string
 *          isActive:
 *            type: boolean
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
 router.post(
  "/",
  passport.authenticate('jwt', { session: false }),
  createPost,
);

/**
 * @swagger
 * /blog-posts/{id}:
 *   put:
 *     description: Update Blog Post in database
 *     tags:
 *       - Blog
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: body
 *       name: body
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *          title:
 *            type: string
 *          url:
 *            type: string
 *          category:
 *            type: string
 *          html:
 *            type: string
 *          metaTitle:
 *            type: string
 *          metaDescription:
 *            type: string
 *          metaKeywords:
 *            type: string
 *          isActive:
 *            type: boolean
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
  "/:id",
  passport.authenticate('jwt', { session: false }),
  updatePost,
);

/**
 * @swagger
 * /blog-posts/{id}:
 *   delete:
 *     description: Delete the Blog Post by ID
 *     tags:
 *       - Blog
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
 *         description: Unauthorized.
 *       419:
 *         description: Error wih delete
 */
 router.delete("/:id", passport.authenticate('jwt', { session: false }), deletePost);

module.exports = router;

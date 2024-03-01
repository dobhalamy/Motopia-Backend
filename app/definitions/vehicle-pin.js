/**
 * @swagger
 *
 * definitions:
 *  Vehicle-pins:
 *   type: object
 *   properties:
 *     picture:
 *       type: string
 *     pin:
 *       type: object
 *       properties:
 *          areas:
 *            type: array
 *            items:
 *               type: object
 *               properties:
 *                   name:
 *                     type: string
 *                   shape:
 *                     type: string
 *                   coords:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       format: int32
 *          description:
 *            type: array
 *            items:
 *               type: object
 *               properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [DAMAGE, FEATURE, POSSIBLE FEATURE]
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *          stockId:
 *           type: string
 *           required: true
 */

/**
 * @swagger
 *
 * definitions:
 *  Admin:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         required: true
 *       _id:
 *         type: string
 *       status:
 *         type: string
 *         default: 'active'
 *       role:
 *         type: string
 *         default: 'ADMIN'
 *  Invite-Admin:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          required: true
 *  Password:
 *      type: object
 *      properties:
 *        password:
 *          type: string
 *          required: true
 *
 */

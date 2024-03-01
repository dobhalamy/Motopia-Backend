/**
 * @swagger
 * securityDefinitions:
 *  ApiKeyAuth:
 *    type: apiKey
 *    in: header
 *    name: Authorization
 *  bearerAuth:
 *    type: apiKey
 *    scheme: bearer
 *    bearerFormat: JWT
 *    in: header
 *    name: Authorization
 * definitions:
 *   Login:
 *     type: object
 *     properties:
 *       token:
 *         type: string
 *       _id:
 *         type: string
 *       status:
 *         type: string
 *       role:
 *         type: string
 *       email:
 *         type: string
 *   Credentials:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         required: true
 *       password:
 *         type: string
 *         required: true
 *         format: password
 */

/**
 * @swagger
 *
 * definitions:
 *  Approved-amount:
 *      type: object
 *      properties:
 *        dmsUserId:
 *          type: string
 *        amount:
 *          type: integer
 *          format: int64
 *        creditAppId:
 *          type: integer
 *          format: int64
 *          required: true
 *        downPayment:
 *          type: integer
 *          format: int64
 *          required: true
 *        saveDate:
 *          type: string
 *        expDate:
 *          type: string
 *  Save-amount:
 *      type: object
 *      properties:
 *        dmsUserId:
 *          type: string
 *          required: true
 *        amount:
 *          type: integer
 *          format: int64
 *          required: true
 *        creditAppId:
 *          type: integer
 *          format: int64
 *          required: true
 *        downPayment:
 *          type: integer
 *          format: int64
 *          required: true
 *
 */

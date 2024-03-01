const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  getVehicleSeoByStockId,
  getFullInfoByStockId,
  exportInventory,
  getPictures,
  getList,
  getPictureWithPin,
  deleteVehicle,
  updateVehicleListWithDMS,
  updateVehicle,
  getPaginatedList,
  vehicleFilters,
  rdsCategoris,
  getFinanceCarCount,
  getInfoByStockIdOrVin,
  assignToDStatus,
  lisntenDMSSync,
} = require('../controllers/vehicles');

/**
 * @swagger
 * /vehicles:
 *   get:
 *     description: Vehicles list
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vehicles list
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicles list
 *       401:
 *         description: User is unauthorized.
 */
router.get('/', getList);

/**
 * @swagger
 * /vehicles/exportInventory:
 *   get:
 *     description: export inventory list
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: export inventory list
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't export inventory list
 *       401:
 *         description: User is unauthorized.
 */
router.get('/exportInventory', exportInventory);

/**
 * @swagger
 * /vehicles/pagination:
 *   get:
 *     description: Paginateed Vehicles list
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Paginateed Vehicles list
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicles list
 *       401:
 *         description: User is unauthorized.
 */
router.get('/pagination', getPaginatedList);

/**
 * @swagger
 * /vehicles/filters:
 *   get:
 *     description: Vehicle Filters
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vehicles Filters
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicles filters list
 *       401:
 *         description: User is unauthorized.
 */
router.get('/filters', vehicleFilters);

/**
 * @swagger
 * /vehicles/rdsCategoris:
 *   get:
 *     description: Vehicle RideShare Categoris
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vehicles RideShare Categoris
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicles rideshare categories
 *       401:
 *         description: User is unauthorized.
 */
router.get('/rdsCategoris', rdsCategoris);

/**
 * @swagger
 * /vehicles:
 *   put:
 *     description: Sync vehicle list with DMS
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfull operation
 *         schema:
 *           $ref: '#/definitions/Success'
 *       500:
 *         description: Can't get vehicles list
 *       401:
 *         description: User is unauthorized.
 */
router.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  updateVehicleListWithDMS
);

router.get('/update-all', lisntenDMSSync);

/**
 * @swagger
 * /vehicles/{stockid}:
 *   get:
 *     description: Full info DMS per Stock ID
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full info DMS per Stock ID
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get info
 *       401:
 *         description: User is unauthorized.
 */
router.get('/:stockid', getFullInfoByStockId);

/**
 * @swagger
 * /vehicles/{stockid}:
 *   get:
 *     description: Full info DMS per Stock ID
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Full info DMS per Stock ID
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get info
 *       401:
 *         description: User is unauthorized.
 */
router.get('/vehiclesSeo/:stockid', getVehicleSeoByStockId);

/**
 * @swagger
 * /vehicles/{stockid}/pictures:
 *   get:
 *     description: Pictures list per Stock ID
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Pictures list per Stock ID
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get info
 *       401:
 *         description: User is unauthorized.
 */
router.get('/:stockid/pictures', getPictures);

/**
 * @swagger
 * /vehicles/{stockid}/pictures/{id}:
 *   get:
 *     description: Picture with pin info
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: stockid
 *         required: true
 *         type: string
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Picture with pin info
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get info
 *       401:
 *         description: User is unauthorized.
 */
router.get('/:stockid/pictures/:id', getPictureWithPin);

/**
 * @swagger
 * /vehicles:
 *   delete:
 *     description: Delete vehicle from DB
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              stockid:
 *                type: string
 *     responses:
 *       200:
 *         description: Delete vehicle from DB
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get info
 *       401:
 *         description: User is unauthorized.
 */
router.delete('/', deleteVehicle);

// /**
//  * @swagger
//  * /vehicles/{id}:
//  *   put:
//  *     description: Updating single vehicle
//  *     tags:
//  *       - Vehicle
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *     - in: body
//  *       name: body
//  *       required: true
//  *       schema:
//  *         $ref: '#/definitions/Vehicle-update'
//  *     - in: path
//  *       name: id
//  *       required: true
//  *       type: string
//  *     responses:
//  *       200:
//  *         description: Success
//  *         schema:
//  *           $ref: '#/definitions/Success'
//  *       401:
//  *         description: vehicle is unauthorized.
//  *       404:
//  *         description: Vehicle not found
//  */
router.put('/:id', updateVehicle);

/**
 * @swagger
 * /vehicles/financeCarCount/{price}:
 *   get:
 *     description: Get Vehicle Count For Finance
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: price
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Get Vehicle Count For Finance
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get vehicle count
 *       401:
 *         description: User is unauthorized.
 */
router.get('/financeCarCount/:price', getFinanceCarCount);

/**
 * @swagger
 * /vehicles/getInfoByStockIdOrVin:
 *   post:
 *     description: Get Info From Stock ID or Vin
 *     tags:
 *       - Vehicles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Vehicle Availability based on Stock/Vin
 *         schema:
 *           $ref: '#/definitions/Success-obj'
 *       400:
 *         description: Can't get info
 *       401:
 *         description: User is unauthorized.
 */
router.post('/getInfoByStockIdOrVin/', getInfoByStockIdOrVin);

/**
 * @swagger
 * /vehicles/assignToDStatus/{id}:
 *   put:
 *     description: Updating single vehicle
 *     tags:
 *       - Vehicle
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           $ref: '#/definitions/Success'
 *       401:
 *         description: vehicle is unauthorized.
 *       404:
 *         description: Vehicle not found
 */
router.put('/assignToDStatus/:id', assignToDStatus);

module.exports = router;

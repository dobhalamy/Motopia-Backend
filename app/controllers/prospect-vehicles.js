const axios = require('axios');
const prospectVehicleModel = require('../models/prospect-vehicles');
const { BadRequest } = require('../helpers/api_error');

exports.getProspectVehicles = async (req, res, next) => {
  const { prospectId } = req.params;
  try {
    const prospectVehicles = await prospectVehicleModel.find({
      prospectId,
    });
    let answer = [];
    if (prospectVehicles.length > 0) {
      answer = await Promise.all(
        prospectVehicles.map(async vehicle => {
          const { stockid } = vehicle;
          const response = await axios.get(
            `https://api.intuitivedms.com/api/Inventory/CheckInventoryStatus?StockId=${stockid}`
          );
          const { status } = response.data;
          const available =
            status === 'A' || status === 'B' || status === 'E' || status === 'H'
              ? 'Available'
              : 'Out of stock';
          const appStatus = vehicle && vehicle.appStatus;
          return {
            stockid: vehicle.stockid,
            downPayment: vehicle.downPayment,
            monthlyPayment: vehicle.monthlyPayment,
            monthlyPaymentPeriod: vehicle.monthlyPaymentPeriod,
            make: vehicle.make,
            model: vehicle.model,
            carYear: vehicle.carYear,
            series: vehicle.series,
            status: available,
            appStatus: appStatus,
          };
        })
      );
    }
    res.json({
      status: 'success',
      data: answer,
    });
  } catch (error) {
    console.error(error);
    next(new BadRequest(error));
  }
};

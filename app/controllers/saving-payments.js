const prospectVehicleModel = require('../models/prospect-vehicles');
const vehicleModel = require('../models/vehicle');
const { fetchBanksForCar } = require('../helpers/savings');

exports.createSavings = async (req, res) => {
  const {
    prospectId,
    creditAppId,
    stockid,
    downPayment,
    monthlyPayment,
    monthlyPaymentPeriod,
    appStatus,
  } = req.body;
  try {
    await fetchBanksForCar(prospectId, creditAppId, stockid);

    const vehicleRecord = await prospectVehicleModel.findOne({
      prospectId,
      stockid,
    });

    const vehicle = await vehicleModel.findOne({ stockid });
    if (!vehicleRecord) {
      await new prospectVehicleModel({
        prospectId,
        stockid,
        make: vehicle.make,
        model: vehicle.model,
        carYear: vehicle.carYear,
        series: vehicle.series,
        downPayment,
        monthlyPayment,
        monthlyPaymentPeriod,
        appStatus,
      }).save();
    }
  } catch (err) {
    console.error(err);
  }

  res.json({
    status: 'success',
  });
};

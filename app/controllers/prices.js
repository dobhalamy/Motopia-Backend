const priceModel = require('../models/prices');
const { InternalServerError, BadRequest } = require('../helpers/api_error');

exports.getPrice = async (req, res, next) => {
  try {
    const prices = await priceModel.find();
    const transform = prices.map(el => ({
      _id: el._id,
      lockDown: el.lockDown,
      downPayment: el.downPayment,
      retailDeposit: el.retailDeposit,
    }))[0];
    res.json({
      status: 'success',
      data: transform,
    });
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError("Can't get pricelist"));
  }
};

exports.setPrice = async (req, res, next) => {
  const { _id, lockDown, downPayment, retailDeposit } = req.body;
  const obj = {
    lockDown: parseFloat(lockDown.replace(',', '.')).toFixed(2),
    downPayment: parseFloat(downPayment.replace(',', '.')).toFixed(2),
    retailDeposit: parseFloat(retailDeposit.replace(',', '.')).toFixed(2),
  };
  try {
    const prices = await priceModel.find();
    if (prices.length === 0) {
      await new priceModel(obj).save();
      res.json({
        status: 'success',
      });
    } else {
      await priceModel.findOneAndUpdate({ _id }, obj);
      res.json({
        status: 'success',
      });
    }
  } catch (error) {
    console.error(error.message || error);
    next(new BadRequest(error.message || error));
  }
};

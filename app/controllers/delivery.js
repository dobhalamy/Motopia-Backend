const Delivery = require('../models/delivery');
const { InternalServerError, BadRequest } = require('../helpers/api_error');

exports.getDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.find();
    const transform = delivery.map(el => ({
      _id: el._id,
      deliveryDays: el.deliveryDays,
      deliveryMiles: el.deliveryMiles,
      isRideShareEnabled: el.isRideShareEnabled,
      deliveryFee: el.deliveryFee,
    }))[0];
    res.json({
      status: 'success',
      data: transform,
    });
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError("Can't get delivery data"));
  }
};

exports.setDelivery = async (req, res, next) => {
  const { _id, deliveryDays, deliveryMiles, isRideShareEnabled, deliveryFee } = req.body;
  const obj = {
    deliveryDays: parseFloat(deliveryDays.replace(',', '.')).toFixed(2),
    deliveryMiles: parseFloat(deliveryMiles.replace(',', '.')).toFixed(2),
    isRideShareEnabled,
    deliveryFee: parseFloat(deliveryFee.replace(',', '.')).toFixed(2),
  };
  try {
    const delivery = await Delivery.find();
    if (delivery.length === 0) {
      await new Delivery(obj).save();
      res.json({
        status: 'success',
      });
    } else {
      await Delivery.findOneAndUpdate({ _id }, obj);
      res.json({
        status: 'success',
      });
    }
  } catch (error) {
    console.error(error.message || error);
    next(new BadRequest(error.message || error));
  }
};

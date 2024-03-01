const CarPurchase = require("../models/car-purchase-requests");
const moment = require("moment");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");

exports.carPurchaseList = async (req, res, next) => {
  try {
    const list = await CarPurchase.find();
    if (list.length === 0)
      return next(new NotFound("No purchases at database"));
    res.json({
      status: "success",
      data: list
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.carPurchaseUnreviewedList = async (req, res, next) => {
  try {
    const list = await CarPurchase.find({ reviewed: false });
    if (list.length === 0)
      return next(new NotFound("No unreviewed purchases at database"));
    res.json({
      status: "success",
      data: list
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.createCarPurchase = async (req, res, next) => {
  const purchase = req.body;
  purchase.date = moment().format();

  const newCarPurchase = new CarPurchase(purchase);
  try {
    const savePurchase = await newCarPurchase.save();
    if (savePurchase) {
      res.json({
        status: "success"
      });
    } else return next(new BadRequest("Can't create purchase"));
  } catch (error) {
    next(new BadRequest(error));
  }
};

exports.updateCarPurchase = async (req, res, next) => {
  const _id = req.params.id;
  const upd = {
    reviewed: true
  };
  try {
    const updatePurchsae = await CarPurchase.findOneAndUpdate({ _id }, upd);
    if (updatePurchsae) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no purchase with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteCarPurchase = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const deletePurchase = await CarPurchase.findOneAndDelete({ _id });
    if (deletePurchase) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no purchase with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

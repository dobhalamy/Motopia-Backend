const CarFax = require("../../models/trash/carfax-requests");
const moment = require("moment");
const { BadRequest, NotAllowed } = require("../../helpers/api_error");
const updateOptions = {
  new: true
};

exports.carfaxList = async (req, res, next) => {
  const list = await CarFax.find();
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get carfax requests list"));
};

exports.carfaxUnreviewedList = async (req, res, next) => {
  const list = await CarFax.find({ reviewed: false });
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get carfax requests list"));
};

exports.createCarFax = async (req, res, next) => {
  const carfax = req.body;
  carfax.date = moment().format();

  const newCarFax = new CarFax(carfax);
  try {
    const saveCarFax = await newCarFax.save();
    if (saveCarFax) {
      res.json({
        status: "success"
      });
    }
  } catch (error) {
    next(new BadRequest(error));
  }
};

exports.updateCarFax = async (req, res, next) => {
  const { _id } = req.params.id;
  const upd = {
    reviewed: true
  };
  try {
    await CarFax.findOneAndUpdate({ _id }, upd);
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteCarFax = async (req, res, next) => {
  const _id = req.params.id;
  try {
    await CarFax.findOneAndDelete({ _id });
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

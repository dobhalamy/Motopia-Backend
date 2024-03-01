const PinModel = require("../models/finance-pins");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");

exports.pinsList = async (req, res, next) => {
  try {
    const list = await PinModel.find();
    if (list.length === 0)
      return next(new NotFound("No finance pins at database"));
    res.json({
      status: "success",
      data: list
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.createFinPin = async (req, res, next) => {
  try {
    const pin = req.body;
    const newFinancePin = new PinModel(pin);
    const newPin = await newFinancePin.save();
    if (newPin) {
      res.json({
        status: "success"
      });
    } else return next(new BadRequest("Can't create finance pin"));
  } catch (error) {
    next(new NotAllowed(error));
  }
};

exports.updateFinPin = async (req, res, next) => {
  try {
    const body = req.body;
    const _id = req.params.id;
    const updatePin = await PinModel.findOneAndUpdate({ _id }, body);
    if (updatePin) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no finance pins with such id"));
  } catch (error) {
    next(new NotFound(error));
  }
};

exports.deleteFinPin = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const deletedPin = await PinModel.findOneAndDelete({ _id });
    if (deletedPin) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no finance pins with such id"));
  } catch (error) {
    next(new NotFound(error));
  }
};

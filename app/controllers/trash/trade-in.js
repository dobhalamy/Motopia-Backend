const TradeInModel = require("../models/trade-in-requests");
const moment = require("moment");
const { BadRequest, NotAllowed } = require("../../helpers/api_error");
const updateOptions = {
  new: true
};

exports.tradeInList = async (req, res, next) => {
  const list = await TradeInModel.find();
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get trade-in requests list"));
};

exports.tradeInUnreviewedList = async (req, res, next) => {
  const list = await TradeInModel.find({ reviewed: false });
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get trade-in requests list"));
};

exports.createTradeIn = async (req, res, next) => {
  const request = req.body;
  request.date = moment().format();

  const newTradeInModel = new TradeInModel(request);
  try {
    const saveTradeIn = await newTradeInModel.save();
    if (saveTradeIn) {
      res.json({
        status: "success"
      });
    }
  } catch (error) {
    next(new BadRequest(error));
  }
};

exports.updateTradeIn = async (req, res, next) => {
  const _id = req.params.id;
  const upd = {
    reviewed: true
  };
  try {
    await TradeInModel.findOneAndUpdate({ _id }, upd);
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteTradeIn = async (req, res, next) => {
  const _id = req.params.id;
  try {
    await TradeInModel.findOneAndDelete({ _id });
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

const InfoModel = require("../models/more-info-requests");
const moment = require("moment");
const { BadRequest, NotAllowed } = require("../../helpers/api_error");
const updateOptions = {
  new: true
};

exports.moreInfoList = async (req, res, next) => {
  const list = await InfoModel.find();
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get more-info requests list"));
};

exports.moreInfoUnreviewedList = async (req, res, next) => {
  const list = await InfoModel.find({ reviewed: false });
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get more-info requests list"));
};

exports.createMoreInfo = async (req, res, next) => {
  const request = req.body;
  request.date = moment().format();

  const newInfoModel = new InfoModel(request);
  try {
    const saveMoreInfo = await newInfoModel.save();
    if (saveMoreInfo) {
      res.json({
        status: "success"
      });
    }
  } catch (error) {
    next(new BadRequest(error));
  }
};

exports.updateMoreInfo = async (req, res, next) => {
  const _id = req.params.id;
  const upd = {
    reviewed: true
  };
  try {
    await InfoModel.findOneAndUpdate({ _id }, upd);
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteMoreInfo = async (req, res, next) => {
  const _id = req.params.id;
  try {
    await InfoModel.findOneAndDelete({ _id });
    res.json({
      status: "success"
    });
  } catch (error) {
    next(new NotAllowed(error));
  }
};

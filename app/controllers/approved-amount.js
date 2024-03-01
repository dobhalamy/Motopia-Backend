const AmountModel = require("../models/approved-amounts");
const AmountJobModel = require('../models/approved-jobs');
const { deleteAmount } = require("../helpers/delete-in-30-days");
const { NotAllowed } = require("../helpers/api_error");
const moment = require("moment");
const schedule = require('node-schedule');

exports.getAmountById = async (req, res) => {
  const amount = await AmountModel.findOne({ dmsUserId: req.params.id });
  if (amount) {
    res.json({
      status: "success",
      data: amount
    });
  } else
    res.json({
      status: "success"
    });
};

exports.saveAmount = async (req, res, next) => {
  const { dmsUserId } = req.body;
  const existAmount = await AmountModel.findOne({ dmsUserId });
  if (existAmount) {
    await AmountModel.deleteOne({ dmsUserId });
  }
  const saveDate = moment().format();
  const expDate = moment()
    .add(30, "days")
    .format();

  const obj = {
    ...req.body,
    saveDate,
    expDate
  };

  const newAmountApproved = new AmountModel(obj);
  try {
    const saveAmount = await newAmountApproved.save();
    if (saveAmount) {
      const job = schedule.scheduleJob(`${saveAmount._id}`, expDate, function() {
        deleteAmount(saveAmount._id);
      });
      await new AmountJobModel({
        name: job.name,
        date: expDate,
      }).save();
      res.json({
        status: "success"
      });
    }
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

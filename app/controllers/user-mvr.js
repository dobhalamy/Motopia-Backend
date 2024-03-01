const ReportModel = require("../models/user-mvr");
const moment = require("moment");
const schedule = require('node-schedule');
const {
  BadRequest
} = require("../helpers/api_error");

exports.getReport = async (req, res, next) => {
  const report = await ReportModel.findOne({
    dmsUserId: req.params.id
  });
  if (report) {
    res.json({
      status: "success",
      data: {
        file: report.file
      }
    });
  } else
    res.json({
      status: "success"
    });
}

exports.saveReport = async (req, res, next) => {
  const {
    dmsUserId,
    creditRdsId,
    file
  } = req.body;
  try {
    const saveDate = moment().format();
    const expDate = moment().add(30, "days").format();
    const newReport = new ReportModel({
      dmsUserId,
      creditRdsId,
      file,
      saveDate,
      expDate,
    });

    
    const existingReport = await ReportModel.findOne({ dmsUserId });
    if (existingReport._id) {
      try {
        const update = await ReportModel.findOneAndUpdate({ dmsUserId }, {
          creditRdsId,
          file,
          saveDate,
          expDate,
        });
        if (update._id) {
          if (schedule.scheduledJobs[dmsUserId]) {
            schedule.scheduledJobs[dmsUserId].reschedule(expDate);
          } else {
            schedule.scheduleJob(String(dmsUserId), expDate, function () {
              ReportModel.findOneAndDelete({
                  _id: report._id
                })
                .then(result => {
                  if (result !== null) {
                    console.info("MVR is deleted " + result._id);
                  }
                })
                .catch(err => console.error(err));
            });
          }
          
          res.json({
            status: "success"
          });
        } 
      } catch (error) {
        console.error(error);
        return new Error(error);
      }
    } else {
      const report = await newReport.save();
      if (report) {
        schedule.scheduleJob(String(dmsUserId), expDate, function () {
          ReportModel.findOneAndDelete({
              _id: report._id
            })
            .then(result => {
              if (result !== null) {
                console.info("MVR is deleted " + result._id);
              }
            })
            .catch(err => console.error(err));
        });
        res.json({
          status: "success"
        });
      }
    }
    
  } catch (error) {
    console.error(error);
    next(new BadRequest('Something wrong'));
  }
}
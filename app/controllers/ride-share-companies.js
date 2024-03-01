const RDSCompany = require("../models/ride-share-companies");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");

exports.rdsComapniesLinst = async (req, res, next) => {
  const list = await RDSCompany.find({ isActive: true }).sort({ name: 1 }).lean();
  if (list) {
    res.json({
      status: "success",
      data: list,
    });
  } else return next(new BadRequest("Can't get ride share companies list"));
};

exports.createRdsCompany = async (req, res, next) => {
  try {
    const { body } = req;
    const newRdsCompany = await new RDSCompany(body).save();
    if (newRdsCompany) {
      res.json({ status: 'success' });
    }
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    next(new NotAllowed(error.message || error));
  }
};

exports.deleteRdsCompany = async (req, res, next) => {
  const { id } = req.params;
  try {
    const removedRdsCompany  = await RDSCompany.findByIdAndDelete(id);
    if (removedRdsCompany) {
      res.json({
        status: "success",
      });
    } else {
      return next(new NotFound("There is no ride share company with such id"));
    }
  } catch (error) {
    return next(new NotAllowed(error.message || error));
  }
};

exports.updateRdsCompany = async (req, res, next) => {
  try {
    const { body, params: { id } } = req;
    const updateRideShareSeo = await RDSCompany.findByIdAndUpdate(id, body, { new: true });
    if (updateRideShareSeo) {
      res.json({
        status: "success",
        data: updateRideShareSeo,
      });
    }
  } catch (error) {
    next(new BadRequest(error.message || error));
  }
};
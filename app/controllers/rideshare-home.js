const RideshareHome = require('../models/Rideshare-home');
const { BadRequest, NotAllowed, NotFound } = require('../helpers/api_error');
const config = require('../../config');
const { destroyImage } = require('../helpers/cloudinary');

exports.rdsHomeList = async (req, res, next) => {
  try {
    const list = await RideshareHome.find();
    if (list.length === 0)
      return next(new NotFound('No Ride share images found in database.'));
    res.json({
      status: 'success',
      data: list,
    });
  } catch (error) {
    console.log(error);
    return next(new BadRequest(error));
  }
};
exports.randomRds = async (req, res, next) => {
  try {
    const randomDocument = await RideshareHome.aggregate([
      { $sample: { size: 1 } },
    ]);
    if (randomDocument === undefined)
      return next(new NotFound('No Ride share images found in database.'));
    res.json({
      status: 'success',
      data: randomDocument,
    });
  } catch (error) {
    console.log(error.message);
    return next(new BadRequest(error.message));
  }
};
exports.createSingleRds = async (req, res, next) => {
  try {
    const { title, visible, img, mobileImg } = req.body;
    const isExists = await RideshareHome.find({ title });
    if (isExists.length > 0) {
      res.json({ status: 'duplicate' });
    } else {
      const newRDSimage = new RideshareHome({ title, visible, img, mobileImg });
      const saveRDSimage = await newRDSimage.save();
      if (saveRDSimage) {
        res.json({
          status: 'success',
        });
      } else return next(new BadRequest("Can't save rds image"));
    }
  } catch (error) {
    next(new NotAllowed(error));
  }
};
exports.updateSingleRds = async (req, res, next) => {
  try {
    const { body: updatedRDS } = req;
    const _id = req.params.id;
    const currentRDSImage = await RideshareHome.findOne({ _id }).lean();
    if (
      updatedRDS.img &&
      updatedRDS.img.publicId &&
      updatedRDS.img.publicId != currentRDSImage.img.publicId
    ) {
      await destroyImage(currentRDSImage.img.publicId);
    }

    if (
      updatedRDS.mobileImg &&
      updatedRDS.mobileImg.publicId &&
      updatedRDS.mobileImg.publicId != currentRDSImage.mobileImg.publicId
    ) {
      await destroyImage(currentRDSImage.mobileImg.publicId);
    }
    await RideshareHome.findByIdAndUpdate({ _id }, updatedRDS);

    res.json({
      status: 'success',
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};
exports.deleteSingleRds = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const deleteRDSImage = await RideshareHome.findOneAndDelete({ _id });
    await destroyImage(deleteRDSImage.img.publicId);
    await destroyImage(deleteRDSImage.mobileImg.publicId);
    if (deleteRDSImage) {
      res.json({
        status: 'success',
      });
    } else
      return next(
        new NotFound('There is no Ride share image data with such id')
      );
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

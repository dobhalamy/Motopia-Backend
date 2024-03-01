const RideShareSeo = require('../models/ride-share-seo');
const { BadRequest, NotAllowed, NotFound } = require('../helpers/api_error');
const { destroyImage } = require('../helpers/cloudinary');

exports.rideShareSeoList = async (req, res, next) => {
  const excludedData = ['Ride Share Home', 'Trade In', 'Finance', 'Home Page'];

  const list = await RideShareSeo.find({
    cityName: { $nin: excludedData.map(item => new RegExp(item, 'i')) },
  });
  if (list) {
    res.json({
      status: 'success',
      data: list,
    });
  } else {
    return next(new BadRequest("Can't get ride share seo list"));
  }
};

exports.seoList = async (req, res, next) => {
  const seoList = await RideShareSeo.find();
  if (seoList) {
    res.json({
      status: 'success',
      data: seoList,
    });
  } else {
    res.json({
      status: 'success',
      data: seoList,
    });
  }
};

exports.getRDSLinks = async (req, res, next) => {
  const excludedData = ['Ride Share Home', 'Trade In', 'Finance', 'Home Page'];

  const list = await RideShareSeo.find({
    active: true,
    cityName: { $nin: excludedData },
  }).lean();
  const mappedLinks = list.map(({ cityName, url }) => ({
    cityName,
    url: url.replace('https://www.gomotopia.com', ''),
  }));

  res.json({
    status: 'success',
    data: mappedLinks,
  });
};

exports.createRideShareSeo = async (req, res, next) => {
  try {
    const { body: rideShareSeo } = req;
    await new RideShareSeo(rideShareSeo).save();
    res.json({ status: 'success' });
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    next(new NotAllowed(error.message || error));
  }
};

exports.deleteRideShareSeo = async (req, res, next) => {
  const { id } = req.params;
  try {
    const item = await RideShareSeo.findById(id);
    if (item.img && item.img.publicId) {
      await destroyImage(item.img.publicId);
    }
    const deletedRideShareSeo = await RideShareSeo.findByIdAndDelete(id);
    if (deletedRideShareSeo) {
      res.json({
        status: 'success',
      });
    } else {
      return next(new NotFound('There is no ride share seo with such id'));
    }
  } catch (error) {
    return next(new NotAllowed(error.message || error));
  }
};

exports.getRideShareSeoById = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const rideShareSeo = await RideShareSeo.find({ _id });
    res.json({
      status: 'success',
      data: rideShareSeo,
    });
  } catch (error) {
    return next(new BadRequest(error.message || error));
  }
};

exports.getRideShareSeoByStateCityAndPlate = async (req, res, next) => {
  try {
    const { query } = req;
    const workState = `^${query.workState}$`;
    const plateType = `^${query.plateType}$`;
    const cityName = `^${query.cityName.split('-').join(' ')}$`;
    const rideShareSeo = await RideShareSeo.findOne({
      workState: {
        $regex: workState,
        $options: 'i',
      },
      cityName: {
        $regex: cityName,
        $options: 'i',
      },
      plateType: {
        $regex: plateType,
        $options: 'i',
      },
    });
    if (rideShareSeo) {
      res.json({
        status: 'success',
        data: rideShareSeo,
      });
    } else
      return next(
        new NotFound('There is no ride share seo with such state & plate')
      );
  } catch (error) {
    next(new NotFound(error.message || error));
  }
};

exports.updateRideShareSeo = async (req, res, next) => {
  const {
    body: update,
    params: { id },
  } = req;
  const existingSeo = await RideShareSeo.findById(id);
  try {
    if (
      update.img &&
      update.img.publicId &&
      existingSeo.img &&
      existingSeo.img.publicId &&
      update.img.src !== existingSeo.img.src
    ) {
      const { publicId } = existingSeo.img;
      await destroyImage(publicId);
    }
    const updateRideShareSeo = await RideShareSeo.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).lean();
    res.json({
      status: 'success',
      data: updateRideShareSeo,
    });
  } catch (error) {
    next(new BadRequest(error.message || error));
  }
};

exports.deleteCityImage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingSeo = await RideShareSeo.findById(id).lean();
    if (existingSeo.img && existingSeo.img.publicId) {
      const { publicId } = existingSeo.img;
      await destroyImage(publicId);
      await RideShareSeo.findByIdAndUpdate(id, {
        img: { src: null, publicId: null },
      });
    }
    res.json({
      status: 'success',
    });
  } catch (error) {
    next(new NotFound(error.message || error));
  }
};

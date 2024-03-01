const BodyTypeModel = require('../models/body-types');
const VehicleModel = require('../models/vehicle');
const { BadRequest } = require('../helpers/api_error');
const { setBodyType } = require('../helpers/dms');

exports.getCarCount = (carBody, vehicle) => {
  let carCount = 0;
  for (let i = 0; i < vehicle.length; i++) {
    if (vehicle[i].carBody === carBody) {
      carCount += 1;
    }
  }
  return carCount;
};

exports.getAllBody = async (req, res, next) => {
  try {
    const list = await BodyTypeModel.find();
    const vehicle = await VehicleModel.find({ carBody: { $exists: true } });
    const transform = list.map(
      ({ carBody, dmsBodyValues, _id, position, isCampaignActive }) => ({
        carBody,
        dmsBodyValues,
        _id,
        position,
        isCampaignActive,
        carCount: this.getCarCount(carBody, vehicle),
      })
    );
    res.json({
      status: 'success',
      data: transform,
    });
  } catch (error) {
    console.error(error);
    next(new BadRequest(error));
  }
};

exports.createBodyCards = async (req, res, next) => {
  const { cards } = req.body;
  const withId = cards.filter(card => card._id);
  const withoutId = cards.filter(card => !card._id);

  try {
    const cardsDB = await BodyTypeModel.find();
    const incomeIds = withId.map(card => card._id);
    const dbIds = cardsDB.map(card => card._id);
    const idsForDelete = [];
    dbIds.map(id => {
      if (!incomeIds.includes(id.toString())) {
        idsForDelete.push(id);
      }
    });
    idsForDelete.map(
      async id => await BodyTypeModel.findOneAndDelete({ _id: id })
    );

    if (withoutId.length > 0) {
      Promise.all(
        withoutId.map(async card => {
          try {
            await new BodyTypeModel(card).save();
          } catch (error) {
            console.error(error);
            next(error);
          }
        })
      );
    }

    const vehicles = await VehicleModel.find();
    Promise.all(
      vehicles.map(async vehicle => {
        try {
          let target = {
            _id: vehicle._id,
            carBody: vehicle.carBody,
            dmsCarBody: vehicle.dmsCarBody,
          };
          const { dmsCarBody } = vehicle;
          target.carBody = await setBodyType(dmsCarBody);
          if (!target.carBody) target.carBody = target.dmsCarBody;
          await VehicleModel.findOneAndUpdate(
            { _id: target._id },
            {
              carBody: target.carBody,
              dmsCarBody: target.dmsCarBody,
            }
          );
        } catch (error) {
          console.error(error);
          next(new BadRequest(error));
        }
      })
    );
    const list = await BodyTypeModel.find();
    const transform = list.map(({ carBody, dmsBodyValues, _id, position }) => ({
      carBody,
      dmsBodyValues,
      _id,
      position,
    }));
    res.json({ status: 'success', data: transform });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getAvailableTypes = async (req, res, next) => {
  try {
    const catalogedTypes = await BodyTypeModel.distinct('carBody');
    const availableTypes = await VehicleModel.where('carBody')
      .nin(catalogedTypes)
      .distinct('carBody');
    res.json({
      status: 'success',
      data: availableTypes,
    });
  } catch (error) {
    console.error(error);
    next(new BadRequest(error));
  }
};

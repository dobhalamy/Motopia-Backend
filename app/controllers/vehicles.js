const { GoogleSpreadsheet } = require('google-spreadsheet');
const VehicleModel = require('../models/vehicle');
const savingsModel = require('../models/saving-payments');
const ChromeModel = require('../models/chrome-features');
const VehicleLimit = require('../models/vehicle-limit');
const { NotFound, InternalServerError } = require('../helpers/api_error');
const { fetchBanksForCar } = require('../helpers/savings');
const { pull, flatMap, countBy } = require('lodash');
const { getVehicleSyncJobDates, runVehicleSync } = require('../helpers/agenda');
const { sendSyncDMSEvent } = require('../helpers/sse');

exports.getFullInfoByStockId = async (req, res, next) => {
  const { stockid } = req.params;
  const { prospectId } = req.query;
  try {
    let vehicle = await VehicleModel.findOne({ stockid })
      .lean()
      .populate('features picturesUrl.pin');
    if (!vehicle) {
      return next(new NotFound('No vehicle with such stockid at DB'));
    }
    if (!vehicle.features) {
      vehicle.features = {
        features: [],
        possibleFeatures: [],
        installedPossibleFeatures: [],
        invWarranties: [],
        invHeadroom: [],
      };
    }
    const answer = {
      vehicle,
    };
    const { styleId } = vehicle;
    if (styleId) {
      const chromeFeatures = await ChromeModel.findOne({ styleId: +styleId });
      answer.chromeFeatures = chromeFeatures;
    }
    if (prospectId) {
      const savings = await savingsModel.findOne({ prospectId, stockid });
      answer.savings = savings;
    }
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: 'success',
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};
exports.getVehicleSeoByStockId = async (req, res, next) => {
  const { stockid } = req.params;
  try {
    const vehicle = await VehicleModel.findOne({ stockid });
    if (!vehicle) {
      return next(new NotFound('No vehicle with such stockid at DB'));
    }
    res.json({
      status: 'success',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPictures = async (req, res, next) => {
  const { stockid } = req.params;
  try {
    const vehicle = await VehicleModel.findOne({ stockid });
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: 'success',
      data: vehicle.picturesUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const vehicleCount = await VehicleModel.count();
    if (vehicleCount === 0) {
      res.json({
        status: 'success',
        data: [],
        totalResults: vehicleCount,
      });
      return;
    }
  } catch (error) {
    console.error(error);
  }
  const page = req.query.page ? Number(req.query.page) : 0;
  const resultPerPage = req.query.pageSize ? Number(req.query.pageSize) : 50;
  let findParams = await getCMSParams(req.query);
  const sortParams = await getCMSSortParams(
    req.query.orderCol,
    req.query.orderDirec
  );

  const vehicleCountParam = {
    picturesUrl: { $exists: true, $not: { $size: 0 } },
  };
  const feVehicleCountParam = {
    picturesUrl: { $exists: true, $not: { $size: 0 } },
    active: { $eq: true },
  };
  const layeredVehiclesParam = {
    picturesUrl: { $exists: true, $not: { $size: 0 } },
    vehiclePins: { $exists: true, $not: { $size: 0 } },
  };
  const prospectId = req.query.prospectId && parseFloat(req.query.prospectId);
  try {
    let vehiclesList = await VehicleModel.aggregate([
      {
        $lookup: {
          from: 'features',
          localField: 'features',
          foreignField: '_id',
          as: 'features',
        },
      },
      {
        $unwind: {
          path: '$features',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          modifierId: { $toString: '$stockid' },
        },
      },
      {
        $lookup: {
          localField: 'modifierId',
          from: 'vehicle-pins',
          foreignField: 'stockId',
          as: 'vehiclePins',
        },
      },
      {
        $addFields: {
          installedPossibleFeatures: '$features.installedPossibleFeatures',
        },
      },
      {
        $addFields: {
          possibleFeatures: '$features.possibleFeatures',
        },
      },
      {
        $match: findParams,
      },
      { $sort: sortParams },
      { $skip: page * resultPerPage },
      { $limit: resultPerPage },
    ]);
    const vehicleWithParamCount = await VehicleModel.aggregate([
      {
        $lookup: {
          from: 'features',
          localField: 'features',
          foreignField: '_id',
          as: 'features1',
        },
      },
      {
        $match: findParams,
      },
      {
        $count: 'count',
      },
    ]);
    const vehiclesCount = await VehicleModel.aggregate([
      {
        $lookup: {
          from: 'features',
          localField: 'features',
          foreignField: '_id',
          as: 'features',
        },
      },
      {
        $match: vehicleCountParam,
      },
      {
        $count: 'count',
      },
    ]);
    const feVehiclesCount = await VehicleModel.aggregate([
      {
        $lookup: {
          from: 'features',
          localField: 'features',
          foreignField: '_id',
          as: 'features',
        },
      },
      {
        $match: feVehicleCountParam,
      },
      {
        $count: 'count',
      },
    ]);

    vehiclesList = await Promise.all(
      vehiclesList.map(async vehicle => {
        const vehiclePinCount = {
          damageCount: 0,
          featureCount: 0,
          instFeatureCount: 0,
        };

        if (vehicle.vehiclePins.length > 0) {
          vehicle.vehiclePins.map(x => {
            let damageLength = x.description.filter(
              x => x.type === 'DAMAGE'
            ).length;
            let featureLength = x.description.filter(
              x => x.type === 'FEATURE'
            ).length;
            let insFeatureLength = x.description.filter(
              x => x.type === 'INSTALLED FEATURE'
            ).length;
            if (damageLength > 0) {
              vehiclePinCount.damageCount =
                vehiclePinCount.damageCount + damageLength;
            }
            if (featureLength > 0) {
              vehiclePinCount.featureCount =
                vehiclePinCount.featureCount + featureLength;
            }
            if (insFeatureLength > 0) {
              vehiclePinCount.instFeatureCount =
                vehiclePinCount.instFeatureCount + insFeatureLength;
            }
          });
        }
        return {
          ...vehicle,
          vehiclePinCount,
        };
      })
    );
    const userSavings = await savingsModel.where('prospectId', prospectId);

    let answer = vehiclesList.filter(vehicle => vehicle.picturesUrl.length > 0);
    const countData = {
      VehiclesCount: vehiclesCount.length > 0 ? vehiclesCount[0].count : 0,
      FeVehiclesCount:
        feVehiclesCount.length > 0 ? feVehiclesCount[0].count : 0,
      UpdatedCount:
        vehicleWithParamCount.length > 0 ? vehicleWithParamCount[0].count : 0,
    };
    const lastUpdated = await getVehicleSyncJobDates();
    if (prospectId && userSavings) {
      const transform = await vehiclesList.map(vehicle => {
        const save = userSavings.find(
          saving => saving.stockid === parseFloat(vehicle.stockid)
        );
        if (save) {
          return {
            _id: vehicle._id,
            stockid: vehicle.stockid,
            stockType: vehicle.stockType,
            styleId: vehicle.styleId,
            condition: vehicle.condition,
            vin: vehicle.vin,
            make: vehicle.make,
            carYear: vehicle.carYear,
            carBody: vehicle.carBody,
            dmsCarBody: vehicle.dmsCarBody,
            model: vehicle.model,
            series: vehicle.series,
            mileage: vehicle.mileage,
            exteriorColor: vehicle.exteriorColor,
            interiorColor: vehicle.interiorColor,
            fuelType: vehicle.fuelType,
            cylinder: vehicle.cylinder,
            warranty: vehicle.warranty,
            seating: vehicle.seating,
            specialAmenities4: vehicle.specialAmenities4,
            baseImageUrl: vehicle.baseImageUrl,
            picturesUrl: vehicle.picturesUrl,
            rideShareCategory: vehicle.rideShareCategory,
            rideShareDesc: vehicle.rideShareDesc,
            lifeStyleCategory: vehicle.lifeStyleCategory,
            lifeStyleDesc: vehicle.lifeStyleDesc,
            features: vehicle.features,
            availabilityStatus: vehicle.availabilityStatus,
            listPrice: vehicle.listPrice,
            possibleFeatures: vehicle.possibleFeatures,
            mpg: vehicle.mpg ? vehicle.mpg : null,
            drivetrain: vehicle.drivetrain ? vehicle.drivetrain : null,
            savings: [
              {
                downPayment: save.downPayment,
                monthlyPayment: save.monthlyPayment,
                monthlyPaymentPeriod: save.monthlyPaymentPeriod,
              },
            ],
            vehiclePin: vehicle.vehiclePin,
          };
        } else return vehicle;
      });
      answer = transform;
    }
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: 'success',
      data: answer,
      totalResults: countData,
      lastUpdated,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getPaginatedList = async (req, res, next) => {
  const prospectId = req.query.prospectId && parseFloat(req.query.prospectId);
  const findParams = await getFilterParams(req.query);
  const page = req.query.page ? req.query.page : 1;
  const resultPerPage = 16;
  const sortParams = await getSortParams(req.query.sort);
  let fetchTimes = 0;
  let minDownPayment = 0;
  let minMonthPayment = 0;
  let maxDownPayment = 1000000;
  let maxMonthPayment = 1000000;

  if (req.query.cdPay && req.query.cdPay.length > 0) {
    const downPayments = req.query.cdPay.split(',');
    minDownPayment = downPayments[0];
    maxDownPayment = downPayments[1];
  }

  if (req.query.monPay && req.query.monPay.length > 0) {
    const monthPayments = req.query.monPay.split(',');
    minMonthPayment = monthPayments[0];
    maxMonthPayment = monthPayments[1];
  }

  let userSavings = await savingsModel
    .where('prospectId', prospectId)
    .where('downPayment')
    .gte(minDownPayment)
    .lte(maxDownPayment)
    .where('monthlyPayment')
    .gte(minMonthPayment)
    .lte(maxMonthPayment);

  const $lookup = {
    from: 'features',
    localField: 'features',
    foreignField: '_id',
    as: 'features',
  };
  const $match = {
    ...findParams,
    markForDeletion: {
      $exists: true,
      $eq: null,
    },
  };

  try {
    const vehiclesList = await VehicleModel.aggregate([
      { $lookup },
      { $match },
      {
        $addFields: {
          recommendation: {
            $divide: [{ $sum: ['$listPrice', '$mileage'] }, '$carYear'],
          },
        },
      },
      { $sort: sortParams },
      { $skip: (page - 1) * resultPerPage },
      { $limit: resultPerPage },
      {
        $project: {
          _id: false,
          'features._id': false,
          'picturesUrl._id': false,
        },
      },
    ]);
    console.log(
      '🚀 ~ file: vehicles.js:374 ~ exports.getPaginatedList= ~ vehiclesList:',
      vehiclesList.length
    );

    const vehiclesCountResult = await VehicleModel.aggregate([
      { $lookup },
      { $match },
      {
        $count: 'count',
      },
    ]);

    const vehiclesCount =
      vehiclesCountResult.length > 0 ? vehiclesCountResult[0].count : 0;

    const userSave = userSavings.find(saving => saving.creditAppId);
    const vehicles = await Promise.all(
      vehiclesList.map(async vehicle => {
        try {
          if (userSavings.length > 0 && prospectId) {
            const currentVehicleSavings = userSavings.find(
              ({ stockid }) => stockid === parseFloat(vehicle.stockid)
            );
            if (!currentVehicleSavings && userSave.creditAppId) {
              await fetchBanksForCar(
                prospectId,
                userSave.creditAppId,
                parseFloat(vehicle.stockid)
              );
              fetchTimes++;
            }
          }
        } catch (error) {
          console.error(error);
        }
        return vehicle;
      })
    );
    console.info('Fetch Banks times: ', fetchTimes);

    userSavings = await savingsModel
      .where('prospectId', prospectId)
      .where('downPayment')
      .gte(minDownPayment)
      .lte(maxDownPayment)
      .where('monthlyPayment')
      .gte(minMonthPayment)
      .lte(maxMonthPayment);

    let answer = vehicles.filter(vehicle => vehicle.picturesUrl.length > 0);
    if (prospectId && userSavings) {
      const transform = vehicles.map(vehicle => {
        const save = userSavings.find(
          saving => saving.stockid === parseFloat(vehicle.stockid)
        );
        if (save) {
          return {
            _id: vehicle._id,
            stockid: vehicle.stockid,
            stockType: vehicle.stockType,
            styleId: vehicle.styleId,
            condition: vehicle.condition,
            vin: vehicle.vin,
            make: vehicle.make,
            carYear: vehicle.carYear,
            carBody: vehicle.carBody,
            dmsCarBody: vehicle.dmsCarBody,
            model: vehicle.model,
            series: vehicle.series,
            mileage: vehicle.mileage,
            exteriorColor: vehicle.exteriorColor,
            interiorColor: vehicle.interiorColor,
            fuelType: vehicle.fuelType,
            cylinder: vehicle.cylinder,
            warranty: vehicle.warranty,
            seating: vehicle.seating,
            specialAmenities4: vehicle.specialAmenities4,
            baseImageUrl: vehicle.baseImageUrl,
            picturesUrl: vehicle.picturesUrl,
            rideShareCategory: vehicle.rideShareCategory,
            rideShareDesc: vehicle.rideShareDesc,
            lifeStyleCategory: vehicle.lifeStyleCategory,
            lifeStyleDesc: vehicle.lifeStyleDesc,
            features: vehicle.features,
            availabilityStatus: vehicle.availabilityStatus,
            listPrice: vehicle.listPrice,
            possibleFeatures: vehicle.possibleFeatures,
            mpg: vehicle.mpg ? vehicle.mpg : null,
            drivetrain: vehicle.drivetrain ? vehicle.drivetrain : null,
            savings: save,
          };
        } else return vehicle;
      });
      answer = transform;
    }
    let vehicleFilterCounter = [];
    if (answer.length) {
      const vehicleKeys = pull(
        Object.keys(answer[0]),
        '_id',
        'stockid',
        'styleId',
        'savings',
        'rideShareDesc',
        'recommendation',
        'eBrochureLink',
        'picturesUrl',
        'baseImageUrl',
        'vin',
        'series',
        'dmsCarBody',
        'batteryRange',
        'rimSize',
        'purchaseDate',
        'possibleFeatures',
        'lifeStyleDesc',
        'active',
        'warranty',
        'condition',
        'stockType',
        'availabilityStatus',
        'oemExt',
        'oemInt',
        'specialAmenities4',
        'interiorColor',
        'features'
      );
      vehicleFilterCounter = await Promise.all(
        vehicleKeys.map(async key => {
          const isFeatures = key === 'features';
          const aggreagation = [
            { $lookup },
            { $match },
            {
              $group: {
                _id: `$${key}`,
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                filterName: '$_id',
                count: '$count',
              },
            },
          ];
          const featuresAggregation = [
            { $lookup },
            { $unwind: '$features' },
            { $match },
            {
              $project: {
                _id: 0,
                features: '$features',
              },
            },
          ];
          const keyAggregate = await VehicleModel.aggregate(
            isFeatures ? featuresAggregation : aggreagation,
            { allowDiskUse: true }
          );

          if (key === 'mpg') {
            return {
              [key]: keyAggregate
                .map(
                  ({ filterName, count }) =>
                    filterName && {
                      filterName: parseFloat(filterName.hwy.low),
                      count,
                    }
                )
                .filter(mpg => mpg),
            };
          }

          if (isFeatures) {
            const featureAnswer = [];
            const featureNames = flatMap(
              keyAggregate.map(({ features }) => features.features)
            ).map(f => f.featureName);
            const countByF = countBy(featureNames);
            for (const key in countByF) {
              if (Object.hasOwnProperty.call(countByF, key)) {
                const count = countByF[key];
                featureAnswer.push({
                  filterName:
                    key === '4G Internet Capability'
                      ? '4G / WiFi'
                      : key.trimEnd(),
                  count,
                });
              }
            }
            return { [key]: featureAnswer };
          }

          return { [key]: keyAggregate };
        })
      );
    }
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: 'success',
      data: answer,
      totalResults: vehiclesCount,
      filtersCounted: vehicleFilterCounter,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getPictureWithPin = async (req, res, next) => {
  const { stockid, id } = req.params;

  try {
    const vehicle = await VehicleModel.findOne({ stockid }).populate(
      'picturesUrl.pin'
    );
    const picture = vehicle.picturesUrl.id(id);
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: 'success',
      data: picture,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  const { stockid } = req.query;
  try {
    const vehicle = await VehicleModel.findOne({ stockid });
    if (!vehicle) {
      next(new NotFound('No vehicle with this id'));
    } else {
      await VehicleModel.findOneAndDelete({ _id: vehicle._id });
      res.json({ status: 'success' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.assignToDStatus = async (req, res, next) => {
  const stockid = req.params.id;
  try {
    const vehicle = await VehicleModel.findOne({ stockid });
    if (!vehicle) {
      next(new NotFound('No vehicle with this id'));
    } else {
      vehicle.availabilityStatus = 'D';
      await VehicleModel.findOneAndUpdate({ _id: vehicle._id }, vehicle);
      res.json({ status: 'success' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updateVehicleListWithDMS = async (req, res, next) => {
  try {
    await runVehicleSync();
    res.json({ status: 'success' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.lisntenDMSSync = async (req, res, next) => {
  try {
    if (req.headers.accept === 'text/event-stream') {
      await sendSyncDMSEvent(req, res);
    } else {
      res.json({ status: 'success' });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    let body = req.body;
    const _id = req.params.id;
    delete body.features;
    delete body.installedPossibleFeatures;
    delete body.possibleFeatures;
    delete body.vehiclePinCount;
    delete body.vehiclePins;
    const updateVehicle = await VehicleModel.findOneAndUpdate({ _id }, body);
    let vehicle = await VehicleModel.aggregate([
      {
        $lookup: {
          from: 'features',
          localField: 'features',
          foreignField: '_id',
          as: 'features',
        },
      },
      {
        $unwind: {
          path: '$features',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          modifierId: { $toString: '$stockid' },
        },
      },
      {
        $lookup: {
          localField: 'modifierId',
          from: 'vehicle-pins',
          foreignField: 'stockId',
          as: 'vehiclePins',
        },
      },
      {
        $addFields: {
          installedPossibleFeatures: '$features.installedPossibleFeatures',
        },
      },
      {
        $addFields: {
          possibleFeatures: '$features.possibleFeatures',
        },
      },
      {
        $match: { stockid: body.stockid },
      },
    ]);

    const vehiclePinCount = {
      damageCount: 0,
      featureCount: 0,
      instFeatureCount: 0,
    };

    if (vehicle[0].vehiclePins.length > 0) {
      vehicle[0].vehiclePins.map(x => {
        let damageLength = x.description.filter(
          x => x.type === 'DAMAGE'
        ).length;
        let featureLength = x.description.filter(
          x => x.type === 'FEATURE'
        ).length;
        let insFeatureLength = x.description.filter(
          x => x.type === 'INSTALLED FEATURE'
        ).length;
        if (damageLength > 0) {
          vehiclePinCount.damageCount =
            vehiclePinCount.damageCount + damageLength;
        }
        if (featureLength > 0) {
          vehiclePinCount.featureCount =
            vehiclePinCount.featureCount + featureLength;
        }
        if (insFeatureLength > 0) {
          vehiclePinCount.instFeatureCount =
            vehiclePinCount.instFeatureCount + insFeatureLength;
        }
      });
    }
    vehicle[0]['vehiclePinCount'] = vehiclePinCount;
    const feVehicleCountParam = {
      picturesUrl: { $exists: true, $not: { $size: 0 } },
      active: { $eq: true },
    };
    const feVehiclesCount = await VehicleModel.aggregate([
      {
        $lookup: {
          from: 'features',
          localField: 'features',
          foreignField: '_id',
          as: 'features',
        },
      },
      {
        $match: feVehicleCountParam,
      },
      {
        $count: 'count',
      },
    ]);
    if (updateVehicle) {
      res.json({
        status: 'success',
        data: vehicle[0],
        FeVehiclesCount:
          feVehiclesCount.length > 0 ? feVehiclesCount[0].count : 0,
      });
    } else return next(new NotFound('There is no vehicle  with such id'));
  } catch (error) {
    next(new NotFound(error));
  }
};

exports.vehicleFilters = async (req, res, next) => {
  try {
    const vehiclesList = await VehicleModel.where({ active: true }).select(
      'carBody exteriorColor mpg mileage carYear make model listPrice'
    );
    res.json({
      status: 'success',
      data: vehiclesList,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.rdsCategoris = async (req, res, next) => {
  const rideShareCategoris = [
    'UBER X',
    'UBER COMFORT',
    'UBER BLACK',
    'UBER XL',
    'UBER SUV',
  ];
  res.json({
    status: 'success',
    data: rideShareCategoris,
  });
};

exports.exportInventory = async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(
      '1kKwT8x8M7axsoVdiKzT32h_awXfx6UNmM3oQhZzJfSA'
    );
    await doc.useServiceAccountAuth(require('../google-cred.json'));
    await doc.loadInfo();
    const headers = [
      'vehicle_id',
      'title',
      'description',
      'url',
      'make',
      'model',
      'year',
      'mileage.value',
      'mileage.unit',
      'image[0].url',
      'transmission',
      'fuel_type',
      'body_style',
      'drivetrain',
      'vin',
      'price',
      'exterior_color',
      'state_of_vehicle',
      'address',
    ];
    const newSheet = await doc.addSheet({ headerValues: headers });
    const initialSheet = doc.sheetsByIndex[0];
    await initialSheet.delete();

    await newSheet.updateProperties({ title: 'Inventory' });

    const rowData = [];
    await newSheet.setHeaderRow(headers);
    const vehicleCountParam = {
      picturesUrl: { $exists: true, $not: { $size: 0 } },
      active: { $eq: true },
    };
    var cmsData = await VehicleModel.aggregate([
      {
        $match: vehicleCountParam,
      },
    ]);
    cmsData.map(async vehicle => {
      let newRow = {
        vehicle_id: vehicle.stockid,
        title: vehicle.make + ' ' + vehicle.model,
        description: vehicle.dmsCarBody,
        url: 'https://gomotopia.com/vehicle/?id=' + vehicle.stockid,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.carYear,
        'mileage.value': vehicle.mileage,
        'mileage.unit': 'MI',
        'image[0].url': vehicle.picturesUrl[0].picture,
        transmission: 'Automatic',
        fuel_type: changeFuelFormat(vehicle.fuelType),
        body_style:
          vehicle.carBody === 'Pickup'
            ? 'TRUCK'
            : vehicle.carBody.toUpperCase(),
        drivetrain: changeDriveTrainFormat(vehicle.drivetrain),
        vin: vehicle.vin,
        price: vehicle.listPrice,
        exterior_color: vehicle.exteriorColor,
        state_of_vehicle: 'USED',
        address:
          "{addr1: '405 RXR Plaza Uniondale', city: 'New York', region: 'NY', postal_code: '11556', country: 'US'}",
      };
      rowData.push(newRow);
    });
    await newSheet.addRows(rowData);
    const rows = await newSheet.getRows();
    res.json({
      status: 'success',
      message: 'Sheet updated with ' + rows.length + ' rows',
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFinanceCarCount = async (req, res, next) => {
  const { price } = req.params;
  let options = {
    picturesUrl: { $exists: true, $not: { $size: 0 } },
    active: { $eq: true },
    listPrice: {
      $gte: 0,
      $lte: parseFloat(price),
    },
  };
  try {
    const vehicleWithParamCount = await VehicleModel.aggregate([
      {
        $match: options,
      },
      {
        $count: 'count',
      },
    ]);
    let vehicleCount = 0;
    if (vehicleWithParamCount.length > 0) {
      vehicleCount = vehicleWithParamCount[0].count;
    }
    res.json({
      status: 'success',
      data: vehicleCount,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getInfoByStockIdOrVin = async (req, res, next) => {
  const { vehicleNum, isStock } = req.body;
  let stockId, vin;
  let vehicle;
  try {
    if (isStock) {
      stockId = Number(vehicleNum);
      vehicle = await VehicleModel.findOne({ stockid: stockId });
    } else {
      vin = vehicleNum;
      vehicle = await VehicleModel.findOne({ vin });
    }
    res.json({
      status: 'success',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

exports.setVehicleLimit = async (req, res, next) => {
  const { _id, vehicleLimit } = req.body;
  const obj = {
    vehicleLimit: parseInt(vehicleLimit),
  };
  try {
    const syncLimit = await VehicleLimit.find();
    if (syncLimit.length === 0) {
      await new VehicleLimit(obj).save();
    } else {
      await VehicleLimit.findOneAndUpdate({ _id }, obj);
    }
    res.json({
      status: 'success',
    });
  } catch (error) {
    console.error(error.message || error);
    next(new BadRequest(error.message || error));
  }
};

exports.getVehicleLimit = async (req, res, next) => {
  try {
    const limitData = await VehicleLimit.find();
    const transform = limitData.map(el => ({
      _id: el._id,
      synclimit: el.vehicleLimit,
    }))[0];
    res.json({
      status: 'success',
      data: transform,
    });
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError("Can't get vehicle sync limit"));
  }
};

function changeFuelFormat(fuel_type) {
  switch (fuel_type) {
    case 'Diesel Fuel':
      return 'DIESEL';
    case 'diesel':
      return 'DIESEL';
    case 'Electric Fuel System':
      return 'ELECTRIC';
    case 'Gasoline Fuel':
      return 'GASOLINE';
    case 'Gas':
      return 'GASOLINE';
    case 'Flex Fuel Capability':
      return 'FLEX';
    case 'FlexibleFuel':
      return 'FLEX';
    case 'Gas/Electric Hybrid':
      return 'HYBRID';
    case 'PetrolFuel':
      return 'PETROL';
    case 'Plug-In Electric/Gas':
      return 'PLUGIN_HYBRID';
    default:
      return 'OTHER';
  }
}

function changeDriveTrainFormat(drivetrain) {
  switch (drivetrain) {
    case 'All Wheel Drive':
      return 'AWD';
    case 'Front Wheel Drive':
      return 'FWD';
    case 'Rear Wheel Drive':
      return 'RWD';
    default:
      return 'OTHER';
  }
}

function getFilterParams(queryParams) {
  let options = {
    picturesUrl: { $exists: true, $not: { $size: 0 } },
    active: { $eq: true },
    listPrice: { $gte: 1000 },
  };

  if (queryParams.price && queryParams.price.length > 0) {
    const prices = queryParams.price.split(',');
    const priceRangeLow = prices[0] > 1000 ? prices[0] : 1000;
    const priceRangeHigh = prices[1] ? prices[1] : 0;

    options = {
      ...options,
      listPrice: {
        $gte: parseFloat(priceRangeLow),
        $lte: parseFloat(priceRangeHigh),
      },
    };
  }

  if (queryParams.models && queryParams.models.length > 0) {
    options = {
      ...options,
      model: { $in: queryParams.models.split(',') },
    };
  }

  if (queryParams.year && queryParams.year.length > 0) {
    const year = queryParams.year.split(',');
    const yearRangeLow = year[0] ? year[0] : 0;
    const yearRangeHigh = year[1] ? year[1] : 0;

    options = {
      ...options,
      carYear: {
        $gte: parseFloat(yearRangeLow),
        $lte: parseFloat(yearRangeHigh),
      },
    };
  }

  if (queryParams.mileage && queryParams.mileage.length > 0) {
    const mileage = queryParams.mileage.split(',');
    const minVehicleMileage = mileage.length > 0 ? mileage[0] : 0;
    const maxVehicleMileage = mileage.length > 0 ? mileage[1] : 0;

    options = {
      ...options,
      mileage: {
        $gte: parseFloat(minVehicleMileage),
        $lte: parseFloat(maxVehicleMileage),
      },
    };
  }

  if (queryParams.body && queryParams.body.length > 0) {
    options = {
      ...options,
      carBody: { $in: queryParams.body.split(',') },
    };
  }

  if (queryParams.seat && queryParams.seat.length > 0) {
    const seats = queryParams.seat.split(',');
    if (seats.indexOf('OTHER') !== -1) {
      const range = Array.from(
        Array.from(Array(Math.ceil(100 - 8)).keys()),
        x => (8 + x).toString()
      );
      seats.splice(seats.indexOf('OTHER'), 1);
      seats.concat(range);
      options = {
        ...options,
        seating: { $in: range },
      };
    } else {
      options = {
        ...options,
        seating: { $in: queryParams.seat.split(',') },
      };
    }
  }

  if (queryParams.color && queryParams.color.length > 0) {
    options = {
      ...options,
      exteriorColor: { $in: queryParams.color.split(',') },
    };
  }

  if (queryParams.fuel && queryParams.fuel.length > 0) {
    options = {
      ...options,
      fuelType: { $in: queryParams.fuel.split(',') },
    };
  }

  if (queryParams.mpg && queryParams.mpg.length > 0) {
    const mileage = queryParams.mileage.split(',');
    const minVehicleMpg = mileage[0] ? mileage[0] : 0;
    const maxVehicleMpg = mileage[1] ? mileage[1] : 0;
    options = {
      ...options,
      $and: [
        { 'mpg.hwy.low': { $gte: parseFloat(minVehicleMpg) } },
        { 'mpg.hwy.high': { $lte: parseFloat(maxVehicleMpg) } },
      ],
    };
  }

  if (queryParams.cyl && queryParams.cyl.length > 0) {
    const cylinderQuery = queryParams.cyl;
    const newQuery = [];
    if (cylinderQuery.includes(4)) {
      newQuery.push(/4/);
    }
    if (cylinderQuery.includes(6)) {
      newQuery.push(/6/);
    }
    if (cylinderQuery.includes(8)) {
      newQuery.push(/8/);
    }

    const getFilterParams = () => {
      if (cylinderQuery.includes('OTHER')) {
        return {
          $not: {
            $in: [/4/, /6/, /8/],
          },
        };
      } else {
        return {
          $in: newQuery,
        };
      }
    };

    options = {
      ...options,
      cylinder: getFilterParams(),
    };
  }

  if (queryParams.drTrain && queryParams.drTrain.length > 0) {
    options = {
      ...options,
      drivetrain: { $in: queryParams.drTrain.split(',') },
    };
  }

  if (queryParams.rideShare && queryParams.rideShare.length > 0) {
    let rideShareOptions = queryParams.rideShare.split(',');

    options = {
      ...options,
      rideShareCategory: { $in: rideShareOptions },
    };
  }

  if (queryParams.lifeStyle && queryParams.lifeStyle.length > 0) {
    options = {
      ...options,
      lifeStyleCategory: { $in: queryParams.lifeStyle.split(',') },
    };
  }

  if (queryParams.standardFeature && queryParams.standardFeature.length > 0) {
    const featureQuery = queryParams.standardFeature.split(',');
    const internetCapabilityIndex = featureQuery.findIndex(el =>
      el.includes('4G')
    );
    const parkingSensorsIndex = featureQuery.findIndex(el =>
      el.includes('Parking Sensors')
    );
    const usbIndex = featureQuery.findIndex(el => el.includes('USB'));

    if (internetCapabilityIndex !== -1) {
      featureQuery.splice(internetCapabilityIndex, 1, '4G Internet Capability');
    }
    if (parkingSensorsIndex !== -1) {
      featureQuery.splice(parkingSensorsIndex, 1, 'Parking Sensors / Assist ');
    }
    if (usbIndex !== -1) {
      featureQuery.splice(usbIndex, 1, 'USB Connectivity ');
    }

    const andFeatures = featureQuery.map(value => ({
      'features.features.featureName': value,
    }));
    const andPossibleFeatures = featureQuery.map(value => ({
      'features.possibleFeatures.featureName': value,
    }));

    options = {
      ...options,
      $or: [
        // Features
        { $and: andFeatures },
        // Possible features
        { $and: andPossibleFeatures },
      ],
    };
  }

  if (queryParams.search && queryParams.search.length > 0) {
    options = {
      ...options,
      $or: [
        { cylinder: { $in: getSearchParams(queryParams.search) } },
        { carBody: { $in: getSearchParams(queryParams.search) } },
        { condition: { $in: getSearchParams(queryParams.search) } },
        { drivetrain: { $in: getSearchParams(queryParams.search) } },
        { exteriorColor: { $in: getSearchParams(queryParams.search) } },
        { fuelType: { $in: getSearchParams(queryParams.search) } },
        { lifeStyleCategory: { $in: getSearchParams(queryParams.search) } },
        { make: { $in: getSearchParams(queryParams.search) } },
        { model: { $in: getSearchParams(queryParams.search) } },
        { rideShareCategory: { $in: getSearchParams(queryParams.search) } },
        { series: { $in: getSearchParams(queryParams.search) } },
        { vin: { $in: getSearchParams(queryParams.search) } },
        {
          'features.features': {
            $elemMatch: {
              featureName: { $in: getSearchParams(queryParams.search) },
            },
          },
        },
        {
          'features.installedPossibleFeatures': {
            $elemMatch: {
              featureName: { $in: getSearchParams(queryParams.search) },
            },
          },
        },
      ],
    };
  }

  if (queryParams.cdPay && queryParams.cdPay.length > 0) {
    const downPayments = queryParams.cdPay.split(',');
    options = {
      ...options,
      'savings.downPayment': {
        $gte: parseFloat(downPayments[0]),
        $lte: parseFloat(downPayments[1]),
      },
    };
  }

  if (queryParams.monPay && queryParams.monPay.length > 0) {
    const monthPayments = queryParams.monPay.split(',');
    options = {
      ...options,
      'savings.monthlyPayment': {
        $gte: parseFloat(monthPayments[0]),
        $lte: parseFloat(monthPayments[1]),
      },
    };
  }

  if (!isNaN(queryParams.search)) {
    options = {
      ...options,
      $or: [{ stockid: { $eq: parseInt(queryParams.search) } }],
    };
  }

  return options;
}

function getSearchParams(searchParam) {
  if (searchParam.toLowerCase() === 'uber x') {
    return [new RegExp('^UBER X', 'i'), new RegExp('^UBER COMFOT', 'i')];
  } else if (searchParam.toLowerCase() === 'uber black') {
    return [new RegExp('^UBER BLACK', 'i'), new RegExp('^UBER SUV', 'i')];
  } else {
    return [new RegExp('^' + searchParam, 'i')];
  }
}

function getSortParams(sortType) {
  switch (sortType) {
    case 'RECOMMENDED':
      return { recommendation: 1 };
    case 'ASCENDING PRICE':
      return { listPrice: 1 };
    case 'DESCENDING PRICE':
      return { listPrice: -1 };
    case 'NEWEST YEAR':
      return { carYear: -1 };
    case 'LOWEST MILEAGE':
      return { mileage: 1 };
    // case "LOWEST DOWNPAYMENT":
    //   return {"savings.downPayment": 1}
    // case "LOWEST MONTHLY PAYMENT":
    //   return {"savings.monthlyPayment": 1}
    default:
      return { recommendation: 1 };
  }
}

function getCMSParams(queryParams) {
  let options = {
    picturesUrl: { $exists: true, $not: { $size: 0 } },
  };
  let isString = isNaN(queryParams.querySearch);
  if (queryParams.active === true) {
    options = {
      ...options,
      active: { $eq: true },
    };
  }
  if (isString) {
    if (queryParams.querySearch && queryParams.querySearch.length > 0) {
      options = {
        ...options,
        $or: [
          { make: { $in: getSearchParams(queryParams.querySearch) } },
          { model: { $in: getSearchParams(queryParams.querySearch) } },
          { series: { $in: getSearchParams(queryParams.querySearch) } },
          {
            rideShareCategory: {
              $in: getSearchParams(queryParams.querySearch),
            },
          },
          {
            lifeStyleCategory: {
              $in: getSearchParams(queryParams.querySearch),
            },
          },
        ],
      };
    }
  } else {
    if (
      queryParams.querySearch &&
      queryParams.querySearch.length > 0 &&
      !isString
    ) {
      options = {
        ...options,
        $or: [
          {
            stockid: {
              $gte: parseFloat(queryParams.querySearch),
              $lte: parseFloat(queryParams.querySearch),
            },
          },
          {
            carYear: {
              $gte: parseFloat(queryParams.querySearch),
              $lte: parseFloat(queryParams.querySearch),
            },
          },
        ],
      };
    }
  }

  return options;
}

function getCMSSortParams(sortCol, sortDirec) {
  if (sortDirec == '1') {
    switch (sortCol) {
      case 'active':
        return { active: 1 };
      case 'stockid':
        return { stockid: 1 };
      case 'carYear':
        return { carYear: 1 };
      case 'make':
        return { make: 1 };
      case 'model':
        return { model: 1 };
      case 'series':
        return { series: 1 };
      case 'mileage':
        return { mileage: 1 };
      case 'rideShareCategory':
        return { rideShareCategory: 1 };
      case 'lifeStyleCategory':
        return { lifeStyleCategory: 1 };
      case 'listPrice':
        return { listPrice: 1 };
      case 'possibleFeatures':
        return { possibleFeatures: 1 };
      case 'installedPossibleFeatures':
        return { installedPossibleFeatures: 1 };
      default:
        return { purchaseDate: 1 };
    }
  } else {
    switch (sortCol) {
      case 'active':
        return { active: -1 };
      case 'stockid':
        return { stockid: -1 };
      case 'carYear':
        return { carYear: -1 };
      case 'make':
        return { make: -1 };
      case 'model':
        return { model: -1 };
      case 'series':
        return { series: -1 };
      case 'mileage':
        return { mileage: -1 };
      case 'rideShareCategory':
        return { rideShareCategory: -1 };
      case 'lifeStyleCategory':
        return { lifeStyleCategory: -1 };
      case 'listPrice':
        return { listPrice: -1 };
      case 'possibleFeatures':
        return { possibleFeatures: -1 };
      case 'installedPossibleFeatures':
        return { installedPossibleFeatures: -1 };
      default:
        return { purchaseDate: -1 };
    }
  }
}

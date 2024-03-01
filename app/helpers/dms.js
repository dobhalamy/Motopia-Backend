const VehicleModel = require('../models/vehicle');
const FeatureModel = require('../models/features');
const BodyTypeModel = require('../models/body-types');
const ChromeModel = require('../models/chrome-features');
const VehicleLimit = require('../models/vehicle-limit');
const Vehicle360 = require('../models/vehicle-360');
const config = require('../../config');
const url = config.get('DMS_Inventory');
const carfaxUrl = config.get('carFaxLink');
const url_list = url + 'AvailableVehicleList';
const url_features = url + 'GetFeatures';
const url_chrome_features = url + 'GetChromFeatures';
const url_360_assets = url + 'GetNonRegularPictures';
const axios = require('axios');
const got = require('got');
const { mapLimit } = require('async');
const { differenceWith, pick } = require('lodash');
const moment = require('moment');
const { updateGoogleSpreadsheet } = require('./google-sheet');

const VEHICLE_REQ_LIMIT = 500;
const cloudinaryUrl = 'https://res.cloudinary.com/luxor-motor-cars-inc/';

exports.getFeatures = async stockid => {
  try {
    const result = await axios
      .get(`${url_features}?stockId=${stockid}`)
      .then(result => result.data);
    const existFeature = await FeatureModel.findOne({ stockid });

    if (!existFeature) {
      const feature = new FeatureModel({
        stockid,
        features: result.features || null,
        possibleFeatures: result.possibleFeatures || null,
        installedPossibleFeatures: result.installedPossibleFeatures || null,
        invWarranties: result.invWarranties || null,
        invHeadroom: result.invHeadroom || null,
        carfax: result.carfax || {},
      });
      const newFeature = await feature.save();
      return newFeature._id;
    } else {
      const feature = await FeatureModel.findOneAndUpdate(
        { _id: existFeature._id },
        {
          features: result.features || null,
          possibleFeatures: result.possibleFeatures || null,
          installedPossibleFeatures: result.installedPossibleFeatures || null,
          invWarranties: result.invWarranties || null,
          invHeadroom: result.invHeadroom || null,
          carfax: result.carfax || {},
        }
      );
      return feature._id;
    }
  } catch (error) {
    const message =
      error.message || `Can't get features for vehicle with ${stockid}`;
    console.error(message);
  }
};

const addChromeFeatures = async vehicles => {
  try {
    const modifiedVehicles = vehicles.map(vehicle =>
      pick(vehicle, ['stockid', 'styleId', 'vin'])
    );
    await mapLimit(modifiedVehicles, VEHICLE_REQ_LIMIT, async vehicle => {
      const { stockid, styleId, vin } = vehicle;
      const existChromeFeature = await ChromeModel.findOne({
        styleId,
      });
      if (!existChromeFeature) {
        const fullUrl = `${url_chrome_features}?stockId=${stockid}&vin=${vin}`;
        const { data } = await axios.get(fullUrl).then(result => result.data);
        const { style, engines, inventoryStandards } = data;
        const drivetrain =
          style.driveTrain === 'Four Wheel Drive'
            ? 'All Wheel Drive'
            : style.driveTrain;

        let incomeStandard = [];
        for (const val in inventoryStandards) {
          const lcase = val.toLowerCase();
          const title = lcase.charAt(0).toUpperCase() + lcase.slice(1);
          const value = {
            title: title,
            desc: inventoryStandards[val],
          };
          incomeStandard.push(value);
        }

        const chromeFeatures = {
          styleId,
          style: {
            drivetrain,
          },
          engine: {},
          standard: incomeStandard,
        };
        if (engines) {
          const {
            engineType,
            fuelEconomy,
            fuelEconomyUnit,
            engineDisplacement,
            cylinder,
            horsePower,
            netTorque,
            batteryRange,
            fuelCapacity,
          } = engines;
          if (engineType) {
            chromeFeatures.engine.engineType = engineType;
          }
          if (horsePower) {
            const val = horsePower.split('||');
            chromeFeatures.engine.horsepower = {
              value: val[0].trim(),
              rpm: val[1].trim(),
            };
          }
          if (netTorque) {
            const val = netTorque.split('||');
            chromeFeatures.engine.netTorque = {
              value: val[0].trim(),
              rpm: val[1].trim(),
            };
          }
          if (cylinder) {
            const cylinderNum = cylinder.split(' ').filter(x => !isNaN(x));
            chromeFeatures.engine.cylinders = cylinderNum[0];
          }
          if (engineDisplacement) {
            chromeFeatures.engine.liters = engineDisplacement;
          }
          if (engineType === 'Electric') {
            if (batteryRange) {
              chromeFeatures.engine.batteryRange = batteryRange || 0;
              chromeFeatures.engine.fuelCapacity = {
                unit: fuelEconomyUnit,
                low: batteryRange,
                high: batteryRange,
              };
            }
          } else {
            if (fuelEconomy) {
              const val = fuelEconomy.split('/');
              chromeFeatures.engine.fuelEconomy = {
                city: {
                  low: val[0].trim(),
                  high: val[1].trim(),
                },
                hwy: {
                  low: val[0].trim(),
                  high: val[1].trim(),
                },
              };
            }
            if (fuelCapacity) {
              chromeFeatures.engine.fuelCapacity = {
                unit: fuelEconomyUnit,
                low: fuelCapacity,
                high: fuelCapacity,
              };
            }
          }
        }
        const newChrome = new ChromeModel(chromeFeatures);
        await newChrome.save();
      }
    });
  } catch (error) {
    console.error(error);
  }
};

exports.availableVehicleList = async job => {
  try {
    const vehicles = await VehicleModel.countDocuments();
    const features = await FeatureModel.countDocuments();
    let vehicleLimit = VEHICLE_REQ_LIMIT;

    console.info('Vehicles at DB: ', vehicles);
    console.info('Features at DB: ', features);

    const vehiclesCopy = await VehicleModel.find().lean();

    // NOTE: Default sync limit for vehicles if we couldn't find sync limit in db
    const limitData = await VehicleLimit.find().lean();
    if (limitData.length > 0) {
      vehicleLimit = limitData[0].vehicleLimit;
    }

    const dmsLink = `${url_list}?records=${vehicleLimit}`;

    const response = await got(dmsLink, { http2: true }).json();
    const { data } = response;

    const availableStatuses = ['A', 'B', 'E', 'H', 'D'];
    let available = [];
    const vinNumbers = [];
    if (data && data.length) {
      // check for duplicate vin elements and remove them
      available = data.filter(el => {
        if (vinNumbers.includes(el.vin)) {
          return null;
        } else {
          return (
            availableStatuses.includes(el.availabilityStatus) &&
            el.picturesUrl &&
            el.picturesUrl.length > 0 &&
            vinNumbers.push(el.vin) &&
            el
          );
        }
      });
      console.info('All vehicles: ', data.length);
      console.info('Available vehicles with sync limit: ', available.length);
    }

    const newExcluded = differenceWith(
      available,
      vehiclesCopy,
      (a, b) => a.vin === b.vin
    );
    const listToDelete = differenceWith(
      vehiclesCopy,
      available,
      (a, b) => a.vin === b.vin
    );
    console.log('vehicle to modify with markForDeletion:', listToDelete.length);
    // Get the current UTC date and time
    const now = moment().utc();

    // Add 72 hours to the current UTC date and time
    const dateAfter72Hours = now
      .add(72, 'hours')
      .utc()
      .format('YYYY-MM-DDT00:00:00.000[Z]');
    for (let i = 0; i < listToDelete.length; i++) {
      const { vin, markForDeletion } = listToDelete[i];
      // add only if markForDeletion is null
      if (markForDeletion === undefined || markForDeletion === null) {
        await VehicleModel.findOneAndUpdate(
          { vin },
          {
            markForDeletion: dateAfter72Hours,
          }
        );
      }
    }

    if (newExcluded.length > 0) {
      await addChromeFeatures(newExcluded);
    }
    const noStyleId = [];
    // NOTE: remove this after correct logic
    await mapLimit(available, VEHICLE_REQ_LIMIT, async vehicle => {
      const { stockid, styleId, carBody, vin, fuelType, lifetimeWarranty } =
        vehicle;
      vehicle.fuelType = this.setFuelType(fuelType);
      try {
        const existingRecord = vehiclesCopy.find(
          vehicle => vehicle.stockid === stockid
        );

        if (existingRecord) {
          vehicle.active = existingRecord.active;
        }

        const featureId = await this.getFeatures(stockid);
        vehicle.features = featureId;
        if (!styleId) {
          noStyleId.push(stockid);
        }
        if (styleId) {
          const chromeFeatures = await ChromeModel.findOne({
            styleId,
          });
          if (chromeFeatures) {
            const { style, engine } = chromeFeatures;
            vehicle.mpg = engine.fuelEconomy;
            vehicle.drivetrain = style.drivetrain;
          }
          if (!chromeFeatures) {
            const fullUrl = `${url_chrome_features}?stockId=${stockid}&vin=${vin}`;
            const { data } = await axios
              .get(fullUrl)
              .then(result => result.data);
            const { style, engines } = data;
            if (engines) {
              const { fuelEconomy } = engines;
              if (fuelEconomy) {
                const val = fuelEconomy.split('/');
                vehicle.mpg = {
                  city: val[0].trim(),
                  hwy: val[1].trim(),
                };
              }
            }
            if (style) {
              const { driveTrain } = style;
              vehicle.drivetrain =
                driveTrain === 'Four Wheel Drive'
                  ? 'All Wheel Drive'
                  : driveTrain;
            }
          }
        }
        vehicle.dmsCarBody = carBody;
        vehicle.carBody = await this.setBodyType(carBody);
        if (!vehicle.carBody) vehicle.carBody = vehicle.dmsCarBody;
        vehicle.carfaxHighlight =
          'One Owner, Personal Use, Regular Maintenance';
        vehicle.carfaxReport = carfaxUrl + vin;
        vehicle.isLifeTimeWarranty = lifetimeWarranty;

        if (!vehicle.is360) {
          vehicle.is360 = false;
        }
        vehicle.markForDeletion = null;
        const model = await VehicleModel.findOneAndUpdate(
          { stockid },
          vehicle,
          { upsert: true, new: true }
        );
        if (vehicle.is360) {
          await this.get360Assets(vehicle);
        }
        return model.stockid;
      } catch (error) {
        console.error(error);
      }
    });
    console.log('>>>>>>>>>>>>>> Sync is finished <<<<<<<<<<<<<<<<');

    // sync google sheet with new vehicle
    await updateGoogleSpreadsheet();
    return {
      available: available.length,
      newExcluded: newExcluded,
      listToDelete: listToDelete,
      vehiclesWithoutStyleID: noStyleId.length,
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};

exports.deleteVehicleFromCMS = async () => {
  try {
    const currentDate = moment()
      .utc()
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const vehiclesCopy = await VehicleModel.find({
      markForDeletion: { $lte: currentDate },
    });
    console.warn(
      'list of vehicle to delete from the CMS:',
      vehiclesCopy.length
    );
    for (let i = 0; i < vehiclesCopy.length; i++) {
      const vehicle = vehiclesCopy[i];

      // delete vehicle whose purchase date is same or earlier then current date
      await VehicleModel.findOneAndDelete({ _id: vehicle._id });
      console.warn(`vehicle deleted successfully: ${vehicle.vin}`);
    }
  } catch (error) {
    console.error(error);
  }
};

exports.setBodyType = async body => {
  try {
    const type = await BodyTypeModel.findOne({
      dmsBodyValues: {
        $in: body,
      },
    });
    if (type) return type.carBody;
    else return null;
  } catch (error) {
    console.error(error);
  }
};

exports.setFuelType = fuelType => {
  if (
    fuelType.toLowerCase().includes('plug-in') ||
    fuelType.toLowerCase().includes('hybrid')
  ) {
    return 'Hybrid';
  } else return fuelType;
};
const transform360Assets = (pictures, vin) =>
  pictures
    .map(({ picture }) => picture)
    .sort((a, b) => {
      const arrayA = a.split('_');
      const arrayB = b.split('_');

      return (
        parseInt(arrayA[arrayA.length - 1]) -
        parseInt(arrayB[arrayB.length - 1])
      );
    })
    .map(pic => {
      let lowRes = pic;
      if (pic.includes(`${vin}/Low`)) {
        lowRes = String(lowRes).replace(`${vin}/Low`, `${vin}/Low/LowRes`);
      }
      if (pic.includes(`${vin}/Mid`)) {
        lowRes = String(lowRes).replace(`${vin}/Mid`, `${vin}/Mid/LowRes`);
      }
      if (pic.includes(`${vin}/High`)) {
        lowRes = String(lowRes).replace(`${vin}/High`, `${vin}/High/LowRes`);
      }

      return { pic: String(pic).replace(cloudinaryUrl, ''), lowRes };
    });

exports.get360Assets = async vehicle => {
  const { stockid, make, model, vin } = vehicle;
  try {
    const countAssets = await Vehicle360.countDocuments({ stockid });
    if (countAssets > 0) {
      return;
    }
    const result = await axios
      .get(url_360_assets, {
        params: {
          stockId: stockid,
        },
      })
      .then(result => result.data);
    if (result.status === 'OK') {
      const degree20 = transform360Assets(result.lowPicturesUrl, vin);
      const degree45 = transform360Assets(result.midPicturesUrl, vin);
      const degree60 = transform360Assets(result.highPicturesUrl, vin);
      const newAsset = {
        stockid,
        defaultPicture: degree20[0].lowRes,
        degree20,
        degree45,
        degree60,
        make,
        model,
      };
      await new Vehicle360(newAsset).save();
    }
    return;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const path = require('path');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const VehicleModel = require('../models/vehicle');
const { isEmpty } = require('lodash');
const moment = require('moment');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREAD_SHEET_ID = '1d7CSAUXlQPx_vDIGeG3yzKmMtqFp_rLXlX4oIF-mWyQ';

exports.updateGoogleSpreadsheet = async job => {
  const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

  //get auth permissions from google
  const auth = new GoogleAuth({
    scopes: SCOPES,
    keyFile: CREDENTIALS_PATH,
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    // clear the old list of vehicles from the sheet
    const response = (
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.SPREAD_SHEET_ID || SPREAD_SHEET_ID,
        range: 'Sheet1',
        auth: client,
        requestBody: {},
      })
    ).data;

    if (response.spreadsheetId === SPREAD_SHEET_ID) {
      console.info('Google spreadsheet was cleared');
    }
    // get updated vehicles list
    const listOfVehicles = await this.getListOfVehicles();

    // update the sheet with the vehicles data
    if (listOfVehicles.length > 0) {
      const response = (
        await sheets.spreadsheets.values.append({
          auth: client,
          spreadsheetId: SPREAD_SHEET_ID,
          range: 'Sheet1',
          valueInputOption: 'RAW',
          prettyPrint: true,
          requestBody: {
            values: listOfVehicles,
          },
        })
      ).data;
      if (Number(response.updates.updatedRows) > 0) {
        console.info(
          `\nGoogle spreadsheet updated row count:${response.updates.updatedRows}\n`
        );
      }
    }
  } catch (error) {
    console.info(error.message || 'Error while updating google spreadsheet');
  }
};

exports.getListOfVehicles = async () => {
  const storeCode = 'Motopia11101';
  const defaultPersonalText = `Whether you're a solo-driver, a couple,
      or driving as a small group, the #model# might very much be
      your perfect accompaniment for your light to moderate driving needs.
      Conquer local commutes, errands, grocery-runs, or whatever suits your
      schedule or commuting needs.`;
  const defaultRDSText =
    'This Vehicle does not qualify for any Rideshare Platforms';

  const vehicles = [
    [
      'id',
      'title',
      'custom_label_0',
      'description',
      'link',
      'image_link',
      'condition',
      'price',
      'availability',
      'color',
      'mileage',
      'year',
      'model',
      'brand',
      'vehicle_msrp',
      'link_template',
      'store_code',
      'vin',
      'product_type',
      'google_product_category',
      'vehicle_fulfillment (option:store_code)',
    ],
  ];
  const updatedVehicle = await VehicleModel.aggregate([
    {
      $addFields: {
        lifeStyleCategory: { $split: ['$lifeStyleCategory', ','] },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'rideShareCategory',
        foreignField: 'category',
        as: 'rideShareDesc',
      },
    },
    {
      $lookup: {
        from: 'lifestyles',
        let: {
          firstLifeStyle: { $arrayElemAt: ['$lifeStyleCategory', 0] },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$category', '$$firstLifeStyle'] }],
              },
            },
          },
          {
            $project: {
              description: 1,
              _id: 0,
            },
          },
        ],
        as: 'styleDescription',
      },
    },
    {
      $match: {
        availabilityStatus: { $in: ['A', 'B', 'D', 'E', 'H'] },
        markForDeletion: {
          $exists: true,
          $eq: null,
        },
      },
    },
  ]);

  if (updatedVehicle.length > 0) {
    for (const vehicle of updatedVehicle) {
      const {
        personalDescription = [],
        rideShareDesc = [],
        make,
        model,
        carBody,
        stockid,
        listPrice,
        picturesUrl,
        condition,
        exteriorColor,
        mileage,
        carYear,
        vin,
      } = vehicle;
      const makeAndModel = `${make} ${model}`;
      const vehicleDescription = `${
        isEmpty(personalDescription)
          ? defaultPersonalText
          : personalDescription[0].description
      } ${
        isEmpty(rideShareDesc) ? defaultRDSText : rideShareDesc[0].description
      }`;
      const updatedVehicleDescription = vehicleDescription
        .replace(/(\[\s*model\s*\]|#model#)/gi, makeAndModel)
        .trim();
      const item = [
        String(stockid),
        `${makeAndModel} ${carBody}`,
        carBody,
        updatedVehicleDescription,
        `https://www.gomotopia.com/vehicle/?id=${stockid}`,
        picturesUrl[0].picture,
        condition,
        `${listPrice} USD`,
        'in_stock',
        exteriorColor,
        `${mileage} miles`,
        String(carYear),
        model,
        make,
        `${listPrice}.000 USD`,
        `https://www.gomotopia.com/vehicle?id=${stockid}&store={store_code}`,
        storeCode,
        vin,
        'Vehicles & Parts > Vehicles > Motor Vehicles > Cars, Trucks & Vans',
        'Vehicles & Parts > Vehicles > Motor Vehicles > Cars, Trucks & Vans',
        `in_store:${storeCode}`,
      ];
      vehicles.push(item);
    }
  }
  return vehicles;
};

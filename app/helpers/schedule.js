const schedule = require('node-schedule');
const moment = require('moment');
const sendGridMail = require('@sendgrid/mail');

const savingsJobModel = require('../models/saving-jobs');
const savingsModel = require('../models/saving-payments');

const amountJobModel = require('../models/approved-jobs');
const amountModel = require('../models/approved-amounts');
const VehicleModel = require('../models/vehicle');
const AdCampaignModel = require('../models/ad-campaign');
const BodyTypeModel = require('../models/body-types');

const { deleteAmount, deleteSavings } = require('./delete-in-30-days');
const { getCarCount } = require('../controllers/body-types');
const config = require('../../config');
sendGridMail.setApiKey(config.get('SENDGRID_KEY'));

exports.checkSchedule = async () => {
  const now = moment().format();
  let allJobs = schedule.scheduledJobs;

  // Jobs, related to saved downpayments & monthly payment per vehicle, and per prospect
  try {
    const savingJobs = await savingsJobModel.where();
    savingJobs.forEach(async ({ name, date }) => {
      if (now > moment(date).format()) {
        await savingsModel.deleteOne({ _id: name });
      } else if (!allJobs[name]) {
        schedule.scheduleJob(String(name), date, function () {
          deleteSavings(name);
        });
      }
    });
    console.info(`Savings Jobs at DB: ${savingJobs.length}`);
  } catch (error) {
    console.error('Error! Problem with saving jobs');
    console.error(error);
  }

  try {
    const amountJobs = await amountJobModel.where();
    amountJobs.forEach(async ({ name, date }) => {
      if (now > moment(date).format()) {
        await amountModel.deleteOne({ _id: name });
      } else if (!allJobs[name]) {
        schedule.scheduleJob(String(name), date, function () {
          deleteAmount(name);
        });
      }
    });
    console.info(`Approved amounts Jobs at DB: ${amountJobs.length}`);
  } catch (error) {
    console.error('Error! Problem with approved amounts jobs');
    console.error(error);
  }

  console.info(
    `Rescheduled Jobs: ${Object.keys(schedule.scheduledJobs).length}`
  );
};

exports.scheduleAdCampaignNotification = time => {
  // Run ad-campaign inventory check
  schedule.scheduleJob('ad-campaign inventory check', time, async () => {
    console.log('ad-campaign inventory check schedule is started');
    const bodyTypeList = await BodyTypeModel.find();
    const { inventoryThreshold, notificationEmail } =
      await AdCampaignModel.findOne();
    const vehicle = await VehicleModel.find({ carBody: { $exists: true } });

    // msg template
    const msg = {
      to: notificationEmail,
      from: 'noreply@gomotopia.com',
    };
    // checking for the inventory threshold count
    for (let i = 0; i < bodyTypeList.length; i++) {
      const carBody = bodyTypeList[i].carBody;
      const isCampaignActive = bodyTypeList[i].isCampaignActive;
      const carBodyCount = getCarCount(carBody, vehicle);

      if (inventoryThreshold < carBodyCount && !isCampaignActive) {
        //send mail to admin about the body type is on
        try {
          await sendGridMail.send({
            ...msg,
            subject: 'INVENTORY NOTIFICATION - ON',
            text: `This is to notify you that ad campaign for the body type ${carBody} is turned on`,
          });
          await BodyTypeModel.findOneAndUpdate(
            { carBody: carBody },
            {
              $set: {
                isCampaignActive: true,
              },
            }
          );
        } catch (error) {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        }
      } else if (inventoryThreshold >= carBodyCount && isCampaignActive) {
        // send mail to admin about the body type is off
        try {
          await sendGridMail.send({
            ...msg,
            subject: 'INVENTORY NOTIFICATION - OFF',
            text: `This is to notify you that ad campaign for the body type ${carBody} is turned off`,
          });
          await BodyTypeModel.findOneAndUpdate(
            { carBody: carBody },
            {
              $set: {
                isCampaignActive: false,
              },
            }
          );
        } catch (error) {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        }
      }
    }
  });
};

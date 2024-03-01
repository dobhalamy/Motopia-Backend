const AdCampaignModel = require('../models/ad-campaign');
const { BadRequest } = require('../helpers/api_error');
const { scheduleAdCampaignNotification } = require('../helpers/schedule');
const moment = require('moment');

exports.getInventoryThreshold = async (req, res, next) => {
  try {
    const adCampaignList = await AdCampaignModel.find();
    res.json({
      status: 'success',
      data: adCampaignList,
    });
  } catch (error) {
    console.error(error);
    next(new BadRequest(error));
  }
};
exports.updateInventoryThreshold = async (req, res, next) => {
  const oneMinDelay = moment().add(1, 'minutes').format();
  const { inventoryThreshold, notificationEmail, _id } = req.body;
  try {
    const updatedAdCampaign = await AdCampaignModel.findByIdAndUpdate(
      _id,
      {
        inventoryThreshold,
        notificationEmail,
      },
      { new: true }
    );
    if (updatedAdCampaign) {
      scheduleAdCampaignNotification(oneMinDelay);
      res.json({
        status: 'success',
        data: updatedAdCampaign,
      });
    } else return next(new BadRequest("Can't update threshold data"));
  } catch (error) {
    console.error(error);
    next(new BadRequest(error));
  }
};

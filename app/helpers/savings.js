const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment');
const config = require('../../config');
const { deleteSavings } = require('../helpers/delete-in-30-days');
const savingsJobModel = require('../models/saving-jobs');
const savingModel = require('../models/saving-payments');

const DMS_URL = config.get('DMS_Bank');
const BANK_URL = DMS_URL + 'GetBankAnalysis';
const APPROVED_TERM = 72;
const DOWNPAYMENT = 0;

const getBanksinfo = array =>
array
  .filter(item => item.decision !== 'Declined')
  .map(item =>
    (item.downPayment === ''
      ? { ...item, downPayment: 0 }
      : {
        ...item,
        downPayment: Math.round(item.downPayment),
      })
  ).map(item => (item.counterDownPayment ?
    { ...item, downPayment: Math.round(item.counterDownPayment.substr(1).slice(0, -1)) }
    : { ...item }))
  .map(item => (item.counterTerm ?
    { ...item, term: Math.round(item.counterTerm.substr(1).slice(0, -1)) }
    : { ...item }));

exports.fetchBanksForCar = async (prospectId, creditAppId, stockid) => {
  try {
    const params = {
      CreditId: creditAppId,
      StockId: stockid,
      AprovedTerm: APPROVED_TERM,
      DownPayment: DOWNPAYMENT,
    };
    const banksRequest = await axios.get(BANK_URL, { params });
    const banksInfo = getBanksinfo(banksRequest.data);
    const existSaving = await savingModel.findOne({ prospectId, stockid });
    if (!existSaving) {
      const savings = await new savingModel({
        prospectId,
        stockid,
        banksInfo,
        creditAppId
      }).save();
      const expDate = moment()
        .add(30, "days")
        .format();
      const job = schedule.scheduleJob(`${savings._id}`, expDate, function() {
        deleteSavings(savings._id);
      });
      await new savingsJobModel({
        name: job.name,
        date: expDate,
      }).save();
    } else {
      await savingModel.updateOne({ _id: existSaving._id }, { banksInfo });
    }
    return true;
  } catch (error) {
    throw new Error(error.message || error);
  }
}
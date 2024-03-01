const { isEmpty } = require('lodash');

exports.isDevEnv = process.env.NODE_ENV === 'development';

exports.AGENDA_NAMES = {
  vehicleSync: 'vehicleSync', // every 4 hours
  vehicleDeletion: 'vehicleDeletion',
};

// const setEveryMinutes = min => `*/${min} * * * *`;
const setEveryHours = hrs => `0 */${hrs} * * *`;

exports.AGENDA_TIME_FRAMES = {
  fourHours: setEveryHours(4),
  midnightAfter30Min: '30 0 * * *',
};

exports.FORMAT_DATE = date => {
  if (!date) {
    return null; // Handle invalid or empty date objects
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
exports.CALCULATE_NO_WEEKS = (startDateString, endDateString) => {
  const isValidDateString = dateString =>
    dateString && !isNaN(Date.parse(dateString));

  if (
    !isValidDateString(startDateString) ||
    !isValidDateString(endDateString)
  ) {
    return 0;
  }

  // Calculate the time difference in milliseconds
  const timeDifference = new Date(endDateString) - new Date(startDateString);

  // Calculate the number of milliseconds in a week
  const millisecondsInAWeek = 7 * 24 * 60 * 60 * 1000;

  // If the time difference is 0 (same start and end date), return 1 week
  if (timeDifference === 0) {
    return 1;
  }

  const numberOfWeeks = Math.ceil(timeDifference / millisecondsInAWeek);

  // Return the number of weeks
  return numberOfWeeks;
};
exports.CALCULATE_AVG_INCOME = (totalIncome, numberOfWeeks) => {
  if (numberOfWeeks === 0) {
    return 0; // To avoid division by zero
  }

  return (weeklyIncome = totalIncome / numberOfWeeks);
};
exports.CALCULATES_DATES = transactions => {
  if (isEmpty(transactions) || !Array.isArray(transactions)) {
    return { earliestDate: null, latestDate: null };
  }

  const earliestDate = new Date(
    Math.min(...transactions.map(transaction => new Date(transaction.date)))
  );
  const latestDate = new Date(
    Math.max(...transactions.map(transaction => new Date(transaction.date)))
  );

  return { earliestDate, latestDate };
};
exports.CALCULATES_MISC_DATES = (miscTransaction, miscOutFlowTransaction) => {
  const allTransactionsDates = [
    ...miscTransaction,
    ...miscOutFlowTransaction,
  ].map(transaction => new Date(transaction.date));
  if (isEmpty(allTransactionsDates)) {
    return { earliestDate: null, latestDate: null };
  }
  const earliestDate = new Date(Math.min(...allTransactionsDates));
  const latestDate = new Date(Math.max(...allTransactionsDates));

  return { earliestDate, latestDate };
};

exports.FILTER_TRANSACTIONS = (transactions, nameCond, amountCond, dateCond) =>
  transactions.report.items[0].accounts[0].transactions.filter(
    ({ name, amount, date }) =>
      nameCond(name) && amountCond(amount) && dateCond(new Date(date))
  );

exports.DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));

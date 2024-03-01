const { isEmpty } = require('lodash');
const PlaidAssets = require('../models/plaid-assets');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { InternalServerError } = require('../helpers/api_error');
const config = require('../../config');
const MOTOPIA_URL = config.get('MOTOPIA_BE');
const MOTOPIA_DEV_BE = config.get('MOTOPIA_BE');

const {
  FORMAT_DATE,
  CALCULATE_NO_WEEKS,
  CALCULATE_AVG_INCOME,
  CALCULATES_DATES,
  FILTER_TRANSACTIONS,
  CALCULATES_MISC_DATES,
  DELAY,
  isDevEnv,
} = require('../constants');

const configuration = new Configuration({
  basePath: PlaidEnvironments.production,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);
exports.createLinkToken = async (req, res, next) => {
  try {
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: process.env.PLAID_CLIENT_ID,
      },
      products: ['assets'],
      client_name: 'Motopia',
      language: 'en',
      country_codes: ['US'],
    });
    res.json(tokenResponse.data);
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError('Internal server error'));
  }
};
exports.exchangePublicToken = async (req, res, next) => {
  const publicToken = req.body.public_token;
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    res.json({ accessToken });
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError('Internal server error'));
  }
};
exports.createAssetReport = async (req, res, next) => {
  let accessTokenArray = [];
  const accessToken = req.body.access_token;
  accessTokenArray.push(accessToken);
  const daysRequested = 90;

  const options = {
    client_report_id: process.env.PLAID_CLIENT_ID,
    webhook: `${isDevEnv ? MOTOPIA_DEV_BE : MOTOPIA_URL}v1/plaid/plaid-webhook`,
  };
  try {
    const response = await plaidClient.assetReportCreate({
      access_tokens: accessTokenArray,
      days_requested: daysRequested,
      options,
    });
    const assetReportId = response.data.asset_report_id;
    const assetReportToken = response.data.asset_report_token;
    // save assetReportId, assetReportToken in db
    const saveAssetsIds = new PlaidAssets({
      assetReportId,
      assetReportToken,
    });
    await saveAssetsIds.save();
    res.json({ assetReportId });
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError('Internal server error'));
  }
};

exports.getAssetReport = async (req, res, next) => {
  const assetReportId = req.body.assetReportId;
  const creditId = req.body.creditId;
  const accountId = req.body.accountInfo.account.mask;
  const bankName = req.body.accountInfo.institution;
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  // Subtract 90 days from the start date
  let totalMiscOutFlowWeeklyIncome = 0;
  let totalMiscWeeklyIncome = 0;
  let totalUberWeeklyIncome = 0;
  let totalLyftWeeklyIncome = 0;
  let existingAsset = null;

  while (existingAsset === null) {
    existingAsset = await PlaidAssets.findOne({
      assetReportId,
      webhookCode: 'PRODUCT_READY',
    });
  }

  const request = {
    asset_report_token: existingAsset.assetReportToken,
    include_insights: true,
  };
  const pdfRequest = {
    asset_report_token: existingAsset.assetReportToken,
  };
  try {
    const response = await plaidClient.assetReportGet(request);
    const transactions = response.data;

    const uberTransaction = FILTER_TRANSACTIONS(
      transactions,
      name => name.toLowerCase().includes('uber'),
      amount => amount < 0,
      date => date >= ninetyDaysAgo && date <= today
    );

    const lyftTransaction = FILTER_TRANSACTIONS(
      transactions,
      name => name.toLowerCase().includes('lyft'),
      amount => amount < 0,
      date => date >= ninetyDaysAgo && date <= today
    );

    const miscTransaction = FILTER_TRANSACTIONS(
      transactions,
      name =>
        !name.toLowerCase().includes('lyft') &&
        !name.toLowerCase().includes('uber'),
      amount => amount < 0,
      date => date >= ninetyDaysAgo && date <= today
    );

    const miscOutFlowTransaction = FILTER_TRANSACTIONS(
      transactions,
      name => true,
      amount => amount > 0,
      date => date >= ninetyDaysAgo && date <= today
    );
    if (!isEmpty(uberTransaction)) {
      for (const transaction of uberTransaction) {
        transaction.amount = Math.abs(transaction.amount);
        totalUberWeeklyIncome = parseFloat(
          (totalUberWeeklyIncome + transaction.amount).toFixed(2)
        );
      }
    }
    if (!isEmpty(lyftTransaction)) {
      for (const transaction of lyftTransaction) {
        transaction.amount = Math.abs(transaction.amount);
        totalLyftWeeklyIncome = parseFloat(
          (totalLyftWeeklyIncome + transaction.amount).toFixed(2)
        );
      }
    }

    if (!isEmpty(miscTransaction)) {
      for (const transaction of miscTransaction) {
        transaction.amount = Math.abs(transaction.amount);
        totalMiscWeeklyIncome = parseFloat(
          (totalMiscWeeklyIncome + transaction.amount).toFixed(2)
        );
      }
    }

    if (!isEmpty(miscOutFlowTransaction)) {
      for (const transaction of miscOutFlowTransaction) {
        totalMiscOutFlowWeeklyIncome = parseFloat(
          (totalMiscOutFlowWeeklyIncome + transaction.amount).toFixed(2)
        );
      }
    }
    const { earliestDate: uberEarliestDate, latestDate: uberLatestDate } =
      CALCULATES_DATES(uberTransaction);
    const { earliestDate: lyftEarliestDate, latestDate: lyftLatestDate } =
      CALCULATES_DATES(lyftTransaction);

    const { earliestDate: miscEarliestDate, latestDate: miscLatestDate } =
      CALCULATES_MISC_DATES(miscTransaction, miscOutFlowTransaction);

    const uberTrasNumberOfWeeks = CALCULATE_NO_WEEKS(
      FORMAT_DATE(uberEarliestDate),
      FORMAT_DATE(uberLatestDate)
    );
    const lyftTrasNumberOfWeeks = CALCULATE_NO_WEEKS(
      FORMAT_DATE(lyftEarliestDate),
      FORMAT_DATE(lyftLatestDate)
    );
    const miscTrasNumberOfWeeks = CALCULATE_NO_WEEKS(
      FORMAT_DATE(miscEarliestDate),
      FORMAT_DATE(miscLatestDate)
    );
    const inFlowTransactionData = {
      creditId,
      bankDetails: {
        bankName: bankName.name,
        institutionId: bankName.institution_id,
        bankFees: 0,
        bankOpenDate: '1900-01-01',
      },
      lyftTransaction:
        lyftTransaction.length > 0
          ? [
              {
                accountId: accountId,
                firstDate: lyftEarliestDate.toISOString().split('T')[0],
                lastDate: lyftLatestDate.toISOString().split('T')[0],
                merchantName: lyftTransaction[0].name,
                personalFinanceCategory: {
                  detailed: lyftTransaction[0].credit_category.detailed,
                  primary: lyftTransaction[0].credit_category.primary,
                },
                averageAmount: {
                  amount: parseFloat(
                    CALCULATE_AVG_INCOME(
                      totalLyftWeeklyIncome,
                      lyftTrasNumberOfWeeks
                    )
                  ),
                },
                lastAmount: {
                  amount: parseFloat(
                    CALCULATE_AVG_INCOME(
                      totalLyftWeeklyIncome,
                      lyftTrasNumberOfWeeks
                    )
                  ),
                },
                lyftAverageWeeklyIncome: parseFloat(
                  CALCULATE_AVG_INCOME(
                    totalLyftWeeklyIncome,
                    lyftTrasNumberOfWeeks
                  )
                ),
              },
            ]
          : [],
      miscTransaction: miscTransaction.map(transaction => ({
        accountId: accountId,
        firstDate: miscEarliestDate.toISOString().split('T')[0],
        lastDate: miscLatestDate.toISOString().split('T')[0],
        averageAmount: {
          amount: transaction.amount,
        },
        lastAmount: {
          amount: transaction.amount,
        },
        merchantName: transaction.name,
        personalFinanceCategory: {
          detailed: transaction.credit_category.detailed,
          primary: transaction.credit_category.primary,
        },
        miscAverageWeeklyIncome: parseFloat(
          CALCULATE_AVG_INCOME(totalMiscWeeklyIncome, miscTrasNumberOfWeeks)
        ),
      })),
      uberTransaction:
        uberTransaction.length > 0
          ? [
              {
                accountId: accountId,
                firstDate: uberEarliestDate.toISOString().split('T')[0],
                lastDate: uberLatestDate.toISOString().split('T')[0],
                merchantName: uberTransaction[0].name,
                personalFinanceCategory: {
                  detailed: uberTransaction[0].credit_category.detailed,
                  primary: uberTransaction[0].credit_category.primary,
                },
                averageAmount: {
                  amount: parseFloat(
                    CALCULATE_AVG_INCOME(
                      totalUberWeeklyIncome,
                      uberTrasNumberOfWeeks
                    )
                  ),
                },
                lastAmount: {
                  amount: parseFloat(
                    CALCULATE_AVG_INCOME(
                      totalUberWeeklyIncome,
                      uberTrasNumberOfWeeks
                    )
                  ),
                },
                uberAverageWeeklyIncome: parseFloat(
                  CALCULATE_AVG_INCOME(
                    totalUberWeeklyIncome,
                    uberTrasNumberOfWeeks
                  )
                ),
              },
            ]
          : [],

      miscOutFlowTransaction: miscOutFlowTransaction.map(transaction => ({
        accountId: accountId,
        firstDate: miscEarliestDate.toISOString().split('T')[0],
        lastDate: miscLatestDate.toISOString().split('T')[0],
        merchantName: transaction.name,
        averageAmount: {
          amount: transaction.amount,
        },
        lastAmount: {
          amount: transaction.amount,
        },
        personalFinanceCategory: {
          detailed: transaction.credit_category.primary,
          primary: transaction.credit_category.primary,
        },
        miscAverageWeeklyExpenditure: parseFloat(
          CALCULATE_AVG_INCOME(
            totalMiscOutFlowWeeklyIncome,
            miscTrasNumberOfWeeks
          )
        ),
      })),
    };

    const pdfResponse = await plaidClient.assetReportPdfGet(pdfRequest, {
      responseType: 'arraybuffer',
    });
    const pdfData = Buffer.from(pdfResponse.data).toString('base64');

    res.json({ inFlowTransactionData, pdfData });
  } catch (error) {
    console.error(error.message || error);
    next(new InternalServerError('Internal server error'));
  }
};

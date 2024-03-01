const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const PaymentModel = require('../models/payment');
const SDKConstants = require('authorizenet').Constants;
const config = require('../../config');
const sgMail = require('@sendgrid/mail');
const dateAWeekAgoISO = new Date(Date.now() - 3600 * 24 * 7).toISOString();
const dateNowISO = new Date().toISOString();

const merchantAuthenticationType =
  new ApiContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName(process.env.AUTHORIZE_API_LOGIN);
merchantAuthenticationType.setTransactionKey(
  process.env.AUTHORIZE_TRANSACTION_KEY
);

const paymentEnvironment =
  process.env.NODE_ENV === 'development'
    ? SDKConstants.endpoint.sandbox
    : SDKConstants.endpoint.production;

exports.generateReceipt = async data => {
  try {
    const fromEmail = 'sales@gomotopia.com';
    const motopiaEmail = 'purchase@gomotopia.com';
    const {
      cardInfo,
      amount,
      description,
      email,
      img,
      pickMethod,
      pickupDate,
      pickupLocation,
      plateInfo,
      infoVehicle,
      downPayment,
      monthlyPayment,
      term,
      transactionId,
    } = data;
    const {
      brand,
      cardNumber,
      prospect,
      vin,
      stockId,
      cardHolder,
      cardZipCode,
    } = cardInfo;
    const { prospectId, firstName, lastName } = prospect;
    const name = firstName + ' ' + lastName;
    const last4 = cardNumber.substring(cardNumber.length - 4);
    const isDelivery = pickMethod === 'Delivery';
    const currency = 'USD';
    const amountPay = `${amount} ${currency}`;
    const paymentMethod = `${brand.toUpperCase()} ****${last4}`;
    const baseEmail = {
      dealType: description,
      pickLoc: pickupLocation,
      pickDate: pickupDate,
      prospectId,
      txnId: transactionId,
      amount: amountPay,
      paymentMethod,
      picture: img,
      isDelivery,
    };

    if (
      description === 'Financing (Car)' ||
      description === 'Financing (Deal)'
    ) {
      sgMail.setApiKey(config.get('SENDGRID_KEY'));
      const vehiclePrice = infoVehicle.listPrice - downPayment;
      const mail = {
        to: email,
        bcc: [motopiaEmail, fromEmail],
        from: fromEmail,
        templateId: 'd-e20f8d06be5a49b582c20855425f1bfb',
        dynamic_template_data: {
          ...baseEmail,
          total: `${vehiclePrice} ${currency}`,
          downPayment: `${downPayment} ${currency}`,
          monthlyPayment: `${monthlyPayment} ${currency}/Mo`,
          term: `${term} months`,
          name,
          cardHolder,
          cardZipCode,
          vin,
          stockId,
        },
      };
      sgMail.send(mail);
    }

    if (description === 'Short-Term Rental' || description === 'Rent-to-own') {
      const { yearFrom, yearTo, make, model, series, rsdStockId } = infoVehicle;
      const vehicleInfo = `${make} ${model} (${yearFrom}-${yearTo
        .toString()
        .slice(-2)})  ${series}`;
      sgMail.setApiKey(config.get('SENDGRID_KEY'));
      const mail = {
        to: email,
        bcc: [motopiaEmail, fromEmail],
        from: fromEmail,
        templateId: 'd-3de81ac41d5d486d8bcbdb1b49949c10',
        dynamic_template_data: {
          ...baseEmail,
          vehicleInfo,
          plateInfo,
          name,
          cardHolder,
          cardZipCode,
          stockId: rsdStockId,
        },
      };
      sgMail.send(mail);
    }

    if (description === 'Retail') {
      sgMail.setApiKey(config.get('SENDGRID_KEY'));
      const mail = {
        to: email,
        bcc: [motopiaEmail, fromEmail],
        from: fromEmail,
        templateId: 'd-de049d68b09e48b8970dfab23a331e2d',
        dynamic_template_data: {
          ...baseEmail,
          name,
          cardHolder,
          cardZipCode,
          vin,
          stockId,
        },
      };
      sgMail.send(mail);
    }

    console.info('Receipt to customer has been sent');
  } catch (error) {
    return new Error(error.message || error);
  }
};

exports.chargeCreditCard = params =>
  new Promise(async (resolve, reject) => {
    try {
      const {
        cardHolder,
        cardNumber,
        expiry,
        cvv,
        amountPay,
        prospect,
        TypePayment,
        cardZipCode,
        description,
      } = params;
      const { creditAppId, prospectId } = prospect;
      const yearNow = String(new Date().getFullYear()).slice(2, 4);
      const monthNow = new Date().getMonth();
      const dateNow = new Date().getDate();
      let invoiceNumber;
      switch (description) {
        case 'Retail':
          invoiceNumber =
            'RET-' + monthNow + dateNow + yearNow + prospect.prospectId;
          break;
        case 'Short-Term Rental':
          invoiceNumber =
            'STR-' + monthNow + dateNow + yearNow + prospect.prospectId;
          break;
        case 'Rent-to-own':
          invoiceNumber =
            'RTO-' + monthNow + dateNow + yearNow + prospect.prospectId;
          break;
        case 'Financing (Car)':
          invoiceNumber =
            'FIN-' + monthNow + dateNow + yearNow + prospect.prospectId;
          break;
        case 'Financing (Deal)':
          invoiceNumber =
            'LDD-' + monthNow + dateNow + yearNow + prospect.prospectId;
          break;
        default:
          invoiceNumber;
      }
      const holderEmail = prospect.email || '';
      const firstName = prospect.firstName || '';
      const lastName = prospect.lastName || '';
      const zip = cardZipCode;
      const contactNumber = prospect.contactNumber || '';
      const creditCard = new ApiContracts.CreditCardType();
      creditCard.setCardNumber(cardNumber);
      creditCard.setExpirationDate(expiry);
      creditCard.setCardCode(cvv);

      const paymentType = new ApiContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

      const orderDetails = new ApiContracts.OrderType();
      orderDetails.setInvoiceNumber(invoiceNumber);
      orderDetails.setDescription(TypePayment);

      const billTo = new ApiContracts.CustomerAddressType();
      billTo.setFirstName(prospect.firstName);
      billTo.setLastName(prospect.lastName);
      billTo.setAddress('');
      billTo.setCity('');
      billTo.setState('');
      billTo.setZip(zip);
      billTo.setCountry('USA');
      billTo.setEmail(prospect.email);
      billTo.setPhoneNumber(prospect.contactNumber);

      const shipTo = new ApiContracts.CustomerAddressType();
      shipTo.setFirstName(prospect.firstName);
      shipTo.setLastName(prospect.lastName);
      shipTo.setAddress('');
      shipTo.setCity('');
      shipTo.setState('');
      shipTo.setZip(zip);
      shipTo.setCountry('USA');

      const userField_a = new ApiContracts.UserField();
      userField_a.setName('A');
      userField_a.setValue('Aval');

      const userField_b = new ApiContracts.UserField();
      userField_b.setName('B');
      userField_b.setValue('Bval');

      const userFieldList = [];
      userFieldList.push(userField_a);
      userFieldList.push(userField_b);

      const userFields = new ApiContracts.TransactionRequestType.UserFields();
      userFields.setUserField(userFieldList);

      const transactionSetting1 = new ApiContracts.SettingType();
      transactionSetting1.setSettingName('duplicateWindow');
      transactionSetting1.setSettingValue('60');

      const transactionSetting2 = new ApiContracts.SettingType();
      transactionSetting2.setSettingName('recurringBilling');
      transactionSetting2.setSettingValue('false');

      const transactionSettingList = [];
      transactionSettingList.push(transactionSetting1);
      transactionSettingList.push(transactionSetting2);

      const transactionSettings = new ApiContracts.ArrayOfSetting();
      transactionSettings.setSetting(transactionSettingList);

      const transactionRequestType = new ApiContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(
        ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
      );
      transactionRequestType.setPayment(paymentType);
      transactionRequestType.setAmount(amountPay);
      transactionRequestType.setUserFields(userFields);
      transactionRequestType.setOrder(orderDetails);
      transactionRequestType.setBillTo(billTo);
      transactionRequestType.setShipTo(shipTo);
      transactionRequestType.setTransactionSettings(transactionSettings);

      const createRequest = new ApiContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      const ctrl = new ApiControllers.CreateTransactionController(
        createRequest.getJSON()
      );
      //Defaults to sandbox
      ctrl.setEnvironment(paymentEnvironment);

      ctrl.execute(async function () {
        const apiResponse = ctrl.getResponse();
        if (apiResponse.messages.resultCode === 'Ok') {
          const response = new ApiContracts.CreateTransactionResponse(
            apiResponse
          );
          if (response != null) {
            const paymentStatusCode = response.getMessages().getResultCode();
            let transactionId = '';
            let paymentStatus = '';
            let statusCodePayment = '';
            if (paymentStatusCode === ApiContracts.MessageTypeEnum.OK) {
              transactionId = response.getTransactionResponse().getTransId();
              if (response.getTransactionResponse().getMessages() != null) {
                paymentStatus = response
                  .getTransactionResponse()
                  .getMessages()
                  .getMessage()[0]
                  .getDescription();
                statusCodePayment = 'OK';
              }
              if (response.getTransactionResponse().getErrors() != null) {
                paymentStatus = response
                  .getTransactionResponse()
                  .getErrors()
                  .getError()[0]
                  .getErrorText();
                statusCodePayment = 'Error';
              }
            }
            const newPayment = new PaymentModel({
              cardHolder,
              cardNumber,
              expiry,
              cvv,
              amountPay,
              holderEmail,
              TypePayment,
              firstName,
              lastName,
              zip,
              contactNumber,
              statusCodePayment,
              transactionId,
              paymentStatus,
              invoiceNumber,
              creditAppId,
              prospectId,
            });
            const isPaymentSaved = await newPayment.save();
            if (
              response.getMessages().getResultCode() ==
              ApiContracts.MessageTypeEnum.OK
            ) {
              if (response.getTransactionResponse().getMessages() != null) {
                console.log(
                  'Successfully created transaction with Transaction ID: ' +
                    response.getTransactionResponse().getTransId()
                );
                console.log(
                  'Response Code: ' +
                    response.getTransactionResponse().getResponseCode()
                );
                console.log(
                  'Message Code: ' +
                    response
                      .getTransactionResponse()
                      .getMessages()
                      .getMessage()[0]
                      .getCode()
                );
                console.log(
                  'Description: ' +
                    response
                      .getTransactionResponse()
                      .getMessages()
                      .getMessage()[0]
                      .getDescription()
                );
                resolve({
                  isSuccess: true,
                  message: 'success',
                  data: response,
                });
              } else {
                console.log('Failed Transaction.');
                if (response.getTransactionResponse().getErrors() != null) {
                  console.log(
                    'Error Code: ' +
                      response
                        .getTransactionResponse()
                        .getErrors()
                        .getError()[0]
                        .getErrorCode()
                  );
                  console.log(
                    'Error message: ' +
                      response
                        .getTransactionResponse()
                        .getErrors()
                        .getError()[0]
                        .getErrorText()
                  );
                  resolve({
                    isSuccess: false,
                    message: response
                      .getTransactionResponse()
                      .getErrors()
                      .getError()[0]
                      .getErrorText(),
                  });
                }
              }
            } else {
              console.log('Failed Transaction. ');
              if (
                response.getTransactionResponse() != null &&
                response.getTransactionResponse().getErrors() != null
              ) {
                console.log(
                  'Error Code: ' +
                    response
                      .getTransactionResponse()
                      .getErrors()
                      .getError()[0]
                      .getErrorCode()
                );
                console.log(
                  'Error message: ' +
                    response
                      .getTransactionResponse()
                      .getErrors()
                      .getError()[0]
                      .getErrorText()
                );
                resolve({
                  isSuccess: false,
                  message: response
                    .getTransactionResponse()
                    .getErrors()
                    .getError()[0]
                    .getErrorText(),
                });
              } else {
                console.log(
                  'Error Code: ' +
                    response.getMessages().getMessage()[0].getCode()
                );
                console.log(
                  'Error message: ' +
                    response.getMessages().getMessage()[0].getText()
                );
                resolve({
                  isSuccess: false,
                  message: response
                    .getTransactionResponse()
                    .getErrors()
                    .getError()[0]
                    .getErrorText(),
                });
              }
            }
          } else {
            console.log('Null Response.');
            resolve({
              isSuccess: false,
              message: 'Null Response.',
            });
          }
        } else {
          console.info(apiResponse.messages.message[0].text);
          const errorText = apiResponse.messages.message[0].text;
          resolve({
            isSuccess: false,
            message: errorText,
          });
        }
      });
    } catch (error) {
      reject();
    }
  });

exports.unsettledTransactionList = () =>
  new Promise((resolve, reject) => {
    const getRequest = new ApiContracts.GetUnsettledTransactionListRequest();

    const paging = new ApiContracts.Paging();
    paging.setLimit(10);
    paging.setOffset(1);

    const sorting = new ApiContracts.TransactionListSorting();
    sorting.setOrderBy(ApiContracts.TransactionListOrderFieldEnum.ID);
    sorting.setOrderDescending(true);

    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setStatus(
      ApiContracts.TransactionGroupStatusEnum.PENDINGAPPROVAL
    );
    getRequest.setPaging(paging);
    getRequest.setSorting(sorting);

    const ctrl = new ApiControllers.GetUnsettledTransactionListController(
      getRequest.getJSON()
    );

    ctrl.execute(function () {
      const apiResponse = ctrl.getResponse();

      const response = new ApiContracts.GetUnsettledTransactionListResponse(
        apiResponse
      );

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        ) {
          if (response.getTransactions() != null) {
            const transactions = response.getTransactions().getTransaction();
            for (const i = 0; i < transactions.length; i++) {
              console.log('Transaction Id : ' + transactions[i].getTransId());
              console.log(
                'Transaction Status : ' + transactions[i].getTransactionStatus()
              );
              console.log('Amount Type : ' + transactions[i].getAccountType());
              console.log(
                'Settle Amount : ' + transactions[i].getSettleAmount()
              );
            }
          }
          console.log(
            'Message Code : ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Message Text : ' + response.getMessages().getMessage()[0].getText()
          );
        } else {
          console.log('Result Code: ' + response.getMessages().getResultCode());
          console.log(
            'Error Code: ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Error message: ' + response.getMessages().getMessage()[0].getText()
          );
          reject(response);
        }
      } else {
        console.log('Null Response.');
        reject(response);
      }

      resolve(response);
    });
  });

exports.transactionList = () =>
  new Promise((resolve, reject) => {
    const paging = new ApiContracts.Paging();
    paging.setLimit(10);
    paging.setOffset(1);

    const sorting = new ApiContracts.TransactionListSorting();
    sorting.setOrderBy(ApiContracts.TransactionListOrderFieldEnum.ID);
    sorting.setOrderDescending(true);

    const getRequest = new ApiContracts.GetTransactionListRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setBatchId(batchId);
    getRequest.setPaging(paging);
    getRequest.setSorting(sorting);

    const ctrl = new ApiControllers.GetTransactionListController(
      getRequest.getJSON()
    );

    ctrl.execute(function () {
      const apiResponse = ctrl.getResponse();

      const response = new ApiContracts.GetTransactionListResponse(apiResponse);

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        ) {
          console.log(
            'Message Code : ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Message Text : ' + response.getMessages().getMessage()[0].getText()
          );
          if (response.getTransactions() != null) {
            const transactions = response.getTransactions().getTransaction();
            for (const i = 0; i < transactions.length; i++) {
              console.log('Transaction Id : ' + transactions[i].getTransId());
              console.log(
                'Transaction Status : ' + transactions[i].getTransactionStatus()
              );
              console.log('Amount Type : ' + transactions[i].getAccountType());
              console.log(
                'Settle Amount : ' + transactions[i].getSettleAmount()
              );
            }
          }
        } else {
          console.log('Result Code: ' + response.getMessages().getResultCode());
          console.log(
            'Error Code: ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Error message: ' + response.getMessages().getMessage()[0].getText()
          );
          reject(response);
        }
      } else {
        console.log('Null Response.');
        reject(response);
      }

      resolve(response);
    });
  });

exports.batchList = () =>
  new Promise((resolve, reject) => {
    const createRequest = new ApiContracts.GetSettledBatchListRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setIncludeStatistics(true);
    createRequest.setFirstSettlementDate(dateAWeekAgoISO);
    createRequest.setLastSettlementDate(dateNowISO);

    const ctrl = new ApiControllers.GetSettledBatchListController(
      createRequest.getJSON()
    );

    ctrl.execute(function () {
      const apiResponse = ctrl.getResponse();

      const response = new ApiContracts.GetSettledBatchListResponse(
        apiResponse
      );

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        ) {
          console.log(
            'Message Code : ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Message Text : ' + response.getMessages().getMessage()[0].getText()
          );

          if (response.getBatchList() != null) {
            const batchItems = response.getBatchList().getBatch();
            for (const i = 0; i < batchItems.length; i++) {
              console.log('Batch Id : ' + batchItems[i].getBatchId());
              console.log(
                'Settlement State : ' + batchItems[i].getSettlementState()
              );
              console.log(
                'Payment Method : ' + batchItems[i].getPaymentMethod()
              );
              console.log('Product : ' + batchItems[i].getProduct());
            }
          }
        } else {
          console.log('Result Code: ' + response.getMessages().getResultCode());
          console.log(
            'Error Code: ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Error message: ' + response.getMessages().getMessage()[0].getText()
          );
          reject(response);
        }
      } else {
        console.log('Null Response.');
        reject(response);
      }

      resolve(response);
    });
  });

exports.paymentPage = () =>
  new Promise((resolve, reject) => {
    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setAmount(800);

    const setting1 = new ApiContracts.SettingType();
    setting1.setSettingName('hostedPaymentButtonOptions');
    setting1.setSettingValue('{"text": "Pay"}');

    const setting2 = new ApiContracts.SettingType();
    setting2.setSettingName('hostedPaymentOrderOptions');
    setting2.setSettingValue('{"show": false}');

    const settingList = [];
    settingList.push(setting1);
    settingList.push(setting2);

    const alist = new ApiContracts.ArrayOfSetting();
    alist.setSetting(settingList);

    const getRequest = new ApiContracts.GetHostedPaymentPageRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setTransactionRequest(transactionRequestType);
    getRequest.setHostedPaymentSettings(alist);

    const ctrl = new ApiControllers.GetHostedPaymentPageController(
      getRequest.getJSON()
    );

    ctrl.execute(function () {
      const apiResponse = ctrl.getResponse();

      const response = new ApiContracts.GetHostedPaymentPageResponse(
        apiResponse
      );

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        ) {
          console.log('Hosted payment page token :');
          console.log(response.getToken());
        } else {
          console.log(
            'Error Code: ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Error message: ' + response.getMessages().getMessage()[0].getText()
          );
          reject(response);
        }
      } else {
        console.log('Null response received');
        reject(response);
      }

      resolve(response.getToken());
    });
  });

exports.createCustomerProfile = email =>
  new Promise((resolve, reject) => {
    var creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber('4242424242424242');
    creditCard.setExpirationDate('0822');

    var paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    var customerAddress = new ApiContracts.CustomerAddressType();
    customerAddress.setFirstName('FirstName');
    customerAddress.setEmail(email);
    customerAddress.setLastName('scenario');
    customerAddress.setAddress('123 Main Street');
    customerAddress.setCity('Bellevue');
    customerAddress.setState('WA');
    customerAddress.setZip('98004');
    customerAddress.setCountry('USA');
    customerAddress.setPhoneNumber('000-000-0000');

    var customerPaymentProfileType =
      new ApiContracts.CustomerPaymentProfileType();
    customerPaymentProfileType.setCustomerType(
      ApiContracts.CustomerTypeEnum.INDIVIDUAL
    );
    customerPaymentProfileType.setPayment(paymentType);
    customerPaymentProfileType.setBillTo(customerAddress);

    var paymentProfilesList = [];
    paymentProfilesList.push(customerPaymentProfileType);

    var customerProfileType = new ApiContracts.CustomerProfileType();
    customerProfileType.setMerchantCustomerId('M_cust');
    customerProfileType.setDescription('Profile description here');
    // customerProfileType.setEmail(utils.getRandomString('cust') + '@anet.net');
    customerProfileType.setPaymentProfiles(paymentProfilesList);

    var createRequest = new ApiContracts.CreateCustomerProfileRequest();
    createRequest.setProfile(customerProfileType);
    createRequest.setValidationMode(ApiContracts.ValidationModeEnum.TESTMODE);
    createRequest.setMerchantAuthentication(merchantAuthenticationType);

    //pretty print request
    //console.log(JSON.stringify(createRequest.getJSON(), null, 2));

    var ctrl = new ApiControllers.CreateCustomerProfileController(
      createRequest.getJSON()
    );

    ctrl.execute(function () {
      var apiResponse = ctrl.getResponse();

      var response = new ApiContracts.CreateCustomerProfileResponse(
        apiResponse
      );

      //pretty print response
      //console.log(JSON.stringify(response, null, 2));

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        ) {
          console.log(
            'Successfully created a customer profile with id: ' +
              response.getCustomerProfileId()
          );
        } else {
          console.log('Result Code: ' + response.getMessages().getResultCode());
          console.log(
            'Error Code: ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Error message: ' + response.getMessages().getMessage()[0].getText()
          );
        }
      } else {
        console.log('Null response received');
      }

      resolve(response.messages);
    });
  });

exports.checkCustomer = email =>
  new Promise((resolve, reject) => {
    var getRequest = new ApiContracts.GetCustomerProfileRequest();
    getRequest.setEmail(email);
    getRequest.setMerchantAuthentication(merchantAuthenticationType);

    //pretty print request
    console.log(JSON.stringify(getRequest.getJSON(), null, 2));

    var ctrl = new ApiControllers.GetCustomerProfileController(
      getRequest.getJSON()
    );

    ctrl.execute(function () {
      var apiResponse = ctrl.getResponse();
      var response = new ApiContracts.GetCustomerProfileResponse(apiResponse);

      if (response != null) {
        if (
          response.getMessages().getResultCode() ==
          ApiContracts.MessageTypeEnum.OK
        ) {
          console.log(
            'Customer profile ID : ' +
              response.getProfile().getCustomerProfileId()
          );
          console.log('Customer Email : ' + response.getProfile().getEmail());
          console.log(
            'Description : ' + response.getProfile().getDescription()
          );
        } else {
          //console.log('Result Code: ' + response.getMessages().getResultCode());
          console.log(
            'Error Code: ' + response.getMessages().getMessage()[0].getCode()
          );
          console.log(
            'Error message: ' + response.getMessages().getMessage()[0].getText()
          );
        }
      } else {
        console.log('Null response received');
      }

      resolve(response.messages);
    });
  });

const ReffererModel = require('../models/referrer');
const PromoCodeModel = require('../models/promo-code');
const DiscountModel = require('../models/promo-discount');
const { BadRequest, NotFound } = require('../helpers/api_error');
const config = require('../../config');
const axios = require('axios');
const generator = require('voucher-code-generator');
const moment = require('moment');
const sgMail = require('@sendgrid/mail');

const DMS_POSPECT_API = config.get('DMS_Prospect');
const DMS_POSPECT_GET_API = `${DMS_POSPECT_API}GetProspect`;
const DMS_POSPECT_UPDATE_API = `${DMS_POSPECT_API}AddProspect`;
const _idRemove = { _id: 0 };

// Generate the new promo code for prospect
const generatePromo = (firstLetters, name, isPartner) => {
  const year = moment().format('YYYY');
  if (!isPartner) {
    const [code] = generator.generate({
      prefix: `${firstLetters}-`,
      postfix: `-${year}`,
      length: 8,
      count: 1,
      charset: generator.charset('alphanumeric'),
    });
    return code;
  }

  const [partnerCode] = generator.generate({
    prefix: `${name.toUpperCase()}-`,
    postfix: `-${year}`,
    length: 5,
    count: 1,
  });
  return partnerCode;
};

// Update DMS prospect with PromoCode and with referrer data
const updateDmsAndSendEmail = async (
  referrer,
  isNewPromoCode,
  promoLocation,
  dealType
) => {
  try {
    const { data } = await axios.get(
      `${DMS_POSPECT_GET_API}?prospectId=${referrer.prospectId}`
    );
    const fromEmail = 'noreply@gomotopia.com';
    const partnerPhoneNumber = '1234567890';
    const dmsProspect = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      source: data.source || 'Motopia-Finance',
      category: data.category,
      contactNumber: referrer.prospectPhoneNumber,
      promoCode: referrer.promoCode.code,
      promoLocation,
      dealType,
    };
    if (referrer.referralSource) {
      dmsProspect.referrer = referrer.referralSource.name;
      dmsProspect.referrerContactNumber = referrer.referralSource.isPartner
        ? partnerPhoneNumber
        : referrer.referralSource.prospectPhoneNumber;
    }
    const response = await axios.post(DMS_POSPECT_UPDATE_API, dmsProspect);
    console.info(`THE DMS PRSOPECT ${referrer.prospectId} IS UPDATED`);

    if (
      response &&
      response.status === 200 &&
      isNewPromoCode &&
      dmsProspect.email
    ) {
      sgMail.setApiKey(config.get('SENDGRID_KEY'));
      const mail = {
        to: dmsProspect.email,
        from: fromEmail,
        templateId: 'd-f28895161b60449db3c832c45fa5ba02',
        dynamic_template_data: {
          promoCode: referrer.promoCode.code,
          promoLink: referrer.promoCode.link,
        },
      };
      sgMail.send(mail);
    }
    return;
  } catch (error) {
    throw new Error(
      error.response.data.errors.Source[0] || error.message || error
    );
  }
};

const handleError = (error, ErrorType, next) => {
  const message = error.message || error;
  console.error(message);
  return next(new ErrorType(message));
};

// Creater Refferer, promo-code and update DMS prospect
exports.createReferrer = async (req, res, next) => {
  const {
    prospectId,
    contactNumber,
    firstName,
    lastName,
    promoCode,
    hasPurchased,
    source,
    dealType,
  } = req.body;
  const firstNameLetter = firstName.split('')[0];
  const lastNameLetter = lastName.split('')[0];
  const firstLetters = `${firstNameLetter}${lastNameLetter}`;
  let promoCodeGenerated;
  let someReferrer;

  try {
    const existingReferrer = await ReffererModel.findOne({ prospectId });
    if (!existingReferrer || !existingReferrer.promoCode) {
      promoCodeGenerated = generatePromo(firstLetters);
    }

    const newReferrerObj = {
      prospectId: parseInt(prospectId),
      prospectPhoneNumber: contactNumber,
      name: `${firstName} ${lastName}`,
      isPurchased: hasPurchased,
      dealType,
      source,
    };

    if (promoCode) {
      const referralCode = await PromoCodeModel.findOne({ code: promoCode });
      const referrer = await ReffererModel.findOne({
        promoCode: referralCode._id,
      });

      newReferrerObj.referralSource = referrer._id;
    }

    if (promoCodeGenerated) {
      const discountDB = await DiscountModel.find();
      const discountSale = discountDB[0].get('saleDiscount');
      const discountRent = discountDB[0].get('rentDiscount');
      const newPromoCode = await new PromoCodeModel({
        code: promoCodeGenerated,
        saleDiscount: discountSale,
        rentDiscount: discountRent,
      }).save();

      newReferrerObj.promoCode = newPromoCode._id;
    }
    if (!existingReferrer) {
      someReferrer = await new ReffererModel(newReferrerObj).save();
    } else {
      someReferrer = await ReffererModel.findOneAndUpdate(
        { prospectId },
        newReferrerObj
      );
    }

    const populatedReferrer = await ReffererModel.findOne(
      { _id: someReferrer },
      _idRemove
    )
      .populate({
        path: 'referralSource',
        populate: {
          path: 'promoCode',
          select: '-_id -discount',
        },
        select: '-_id',
      })
      .populate({
        path: 'promoCode',
        populate: {
          path: 'discount',
          select: '-_id',
        },
        select: '-_id',
      });

    await updateDmsAndSendEmail(
      populatedReferrer,
      !!promoCodeGenerated,
      source,
      dealType
    );

    res.json({
      status: 'success',
    });
  } catch (error) {
    handleError(error, BadRequest, next);
  }
};

exports.getRefererrs = async (req, res, next) => {
  try {
    const list = await ReffererModel.aggregate([
      {
        $lookup: {
          from: 'promo-codes',
          localField: 'promoCode',
          foreignField: '_id',
          as: 'promoCode',
        },
      },
      {
        $lookup: {
          from: 'promo-referrers',
          localField: 'referralSource',
          foreignField: '_id',
          as: 'referralSource',
        },
      },
      {
        $match: {
          isPartner: { $eq: false },
        },
      },
    ]);
    const transform = list.map(x => {
      const {
        _id,
        name,
        prospectId,
        promoCode,
        prospectPhoneNumber,
        referralSource,
        isPurchased,
        dealType,
        source,
      } = x;
      const transformedCustomer = {
        _id,
        name,
        prospectId,
        prospectPhoneNumber,
        dealType,
        source,
      };
      transformedCustomer.isPurchased = isPurchased == true ? 'Yes' : 'No';
      if (promoCode.length > 0) {
        const { code, link, saleDiscount, rentDiscount } = promoCode[0];
        transformedCustomer.promoCode = code;
        transformedCustomer.promoLink = link;

        if (saleDiscount && rentDiscount) {
          transformedCustomer.saleDiscount = saleDiscount;
          transformedCustomer.rentDiscount = rentDiscount;
        }
      }

      if (referralSource.length > 0) {
        const { name, prospectId, prospectPhoneNumber } = referralSource[0];
        transformedCustomer.referralName = name;
        transformedCustomer.referralProspectId = prospectId;
        transformedCustomer.referralPhoneNumber = prospectPhoneNumber;
      }

      return transformedCustomer;
    });

    res.json({
      status: 'success',
      data: transform,
    });
  } catch (error) {
    handleError(error, BadRequest, next);
  }
};

// Create the partner
exports.createPartner = async (req, res, next) => {
  const {
    partnerSaleDiscount,
    partnerRentDiscount,
    promoCode,
    rentWeeklyDiscount = '',
  } = req.body;
  const name = req.body.name.toUpperCase();
  try {
    const newPromoCode = await new PromoCodeModel({
      code: promoCode.toUpperCase(),
      partnerSaleDiscount: parseInt(partnerSaleDiscount),
      partnerRentDiscount: parseInt(partnerRentDiscount),
      rentWeeklyDiscount: rentWeeklyDiscount,
    }).save();
    const newPartner = await new ReffererModel({
      name,
      promoCode: newPromoCode._id,
      isPartner: true,
      isRentalWeeklyDiscount: rentWeeklyDiscount !== '',
    }).save();
    const partner = await ReffererModel.findOne({
      _id: newPartner._id,
    }).populate('promoCode', _idRemove);
    res.json({
      status: 'success',
      data: partner,
    });
  } catch (error) {
    handleError(error, BadRequest, next);
  }
};

// Update the partner if exist
exports.updateParnter = async (req, res, next) => {
  try {
    const { partnerSaleDiscount, partnerRentDiscount } = req.body;
    const _id = req.params.id;
    const name = req.body.name.toUpperCase();
    const existingPartner = await ReffererModel.findOneAndUpdate(
      { _id },
      { name }
    );
    await PromoCodeModel.findOneAndUpdate(
      { _id: existingPartner.promoCode },
      {
        partnerSaleDiscount: parseInt(partnerSaleDiscount),
        partnerRentDiscount: parseInt(partnerRentDiscount),
      }
    );
    const updatedPartner = await ReffererModel.findOne({ _id }).populate(
      'promoCode',
      _idRemove
    );
    res.json({
      status: 'success',
      data: updatedPartner,
    });
  } catch (error) {
    handleError(error, NotFound, next);
  }
};

exports.getPartners = async (req, res, next) => {
  try {
    const list = await ReffererModel.find({ isPartner: true }).populate(
      'promoCode',
      _idRemove
    );

    const transform = list.map(partner => {
      const {
        code,
        link,
        partnerSaleDiscount,
        partnerRentDiscount,
        rentWeeklyDiscount,
      } = partner.promoCode;

      return {
        _id: partner._id,
        name: partner.name,
        promoCode: code,
        promoLink: link,
        partnerSaleDiscount,
        partnerRentDiscount,
        rentWeeklyDiscount,
      };
    });

    res.json({
      status: 'success',
      data: transform,
    });
  } catch (error) {
    handleError(error, BadRequest, next);
  }
};

exports.deletePartner = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const partner = await ReffererModel.findOne({ _id });
    if (!partner) {
      throw new Error('The partner is not found');
    } else {
      await ReffererModel.findOneAndDelete({ _id });
      res.json({
        status: 'succcess',
      });
    }
  } catch (error) {
    handleError(error, NotFound, next);
  }
};

// Apply promo-code if exist
exports.checkPromoAndUpdateCustomer = async (req, res, next) => {
  const { prospectId, promoCode, firstName, lastName, contactNumber, source } =
    req.body;
  const response = {
    code: promoCode,
    saleDiscount: 0,
    rentDiscount: 0,
    applyCode: true,
  };
  try {
    const customerExists = await ReffererModel.findOne({ prospectId });
    const isExisting = await PromoCodeModel.findOne({
      code: promoCode,
    }).populate({
      path: 'discount',
      select: '-_id',
    });
    let currentCustomer;
    if (isExisting) {
      if (!customerExists) {
        const newReferrerObj = {
          prospectId: parseInt(prospectId),
          prospectPhoneNumber: contactNumber,
          name: `${firstName} ${lastName}`,
          isPurchased: false,
          source,
          dealType: 'Online',
        };
        await new ReffererModel(newReferrerObj).save();
        currentCustomer = await ReffererModel.findOne({ prospectId });
      } else {
        currentCustomer = customerExists;
      }
      let oldReferrer;
      //Get the owner of existing promo code
      if (currentCustomer.referralSource) {
        oldReferrer = await ReffererModel.findOne({
          _id: customerExists.referralSource,
        });
      }

      // Get the owner of promo code
      const promoOwner = await ReffererModel.findOne({
        promoCode: isExisting._id,
      });

      // Check if current user is not trying to apply his promo code
      if (promoOwner._id === currentCustomer._id) {
        response.applyCode = false;
        res.json({
          status: 'success',
          data: response,
        });
      }

      // Update the user's referral source if it not the same
      if (currentCustomer.referralSource !== promoOwner._id) {
        const updateReferrer = await ReffererModel.findOneAndUpdate(
          { prospectId },
          {
            referralSource: promoOwner._id,
            isPurchased: false, // Needed attention when creating new referrer
          }
        );
      }

      response.saleDiscount =
        isExisting.partnerSaleDiscount || isExisting.saleDiscount;
      response.rentDiscount =
        isExisting.partnerRentDiscount || isExisting.rentDiscount;
      res.json({
        status: 'success',
        data: response,
      });
    } else {
      response.applyCode = false;
      res.json({
        status: 'success',
        data: response,
      });
    }
  } catch (error) {
    handleError(error, NotFound, next);
  }
};

// Get the Referral disounts list
exports.getDisounts = async (req, res, next) => {
  try {
    const discountsDB = await DiscountModel.find();
    const discounts = discountsDB[0] || {};
    res.json({
      status: 'success',
      data: discounts,
    });
  } catch (error) {
    handleError(error, BadRequest, next);
  }
};

// Update the Referral disounts
exports.setDisounts = async (req, res, next) => {
  const { _id, saleDiscount, rentDiscount } = req.body;
  const obj = {
    saleDiscount: parseInt(saleDiscount),
    rentDiscount: parseInt(rentDiscount),
  };
  try {
    const discountsDB = await DiscountModel.find();
    if (discountsDB.length === 0) {
      await new priceModel(obj).save();
      res.json({
        status: 'success',
      });
    } else {
      await DiscountModel.findOneAndUpdate({ _id }, obj);
      res.json({
        status: 'success',
      });
    }
  } catch (error) {
    handleError(error, BadRequest, next);
  }
};

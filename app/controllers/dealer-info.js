const DealerModel = require("../models/dealer-info");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");
const config = require("../../config");
const folderName = config.get("dealerFolder");

const { uploadImage, destroyImage } = require("../helpers/cloudinary");

const transformOutput = dealer => {
  const { _id, name, phone, address, logo } = dealer;
  return {
    _id,
    name,
    phone,
    address,
    logo: logo.src
  };
};

exports.dealerInfo = async (req, res, next) => {
  try {
    const list = await DealerModel.find();
    if (list.length === 0)
      return next(new NotFound("No Dealer's contact information"));
    res.json({
      status: "success",
      data: transformOutput(list[0])
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.createDealerInfo = async (req, res, next) => {
  try {
    const list = await DealerModel.find();
    if (list.length >= 1)
      return next(
        new NotAllowed("There are already present Dealer's contact information")
      );
    const { body, file } = req;
    const logo = await uploadImage(file, folderName);
    const dealer = {
      ...body,
      logo: {
        src: logo.secure_url,
        publicId: logo.public_id
      }
    };
    const newDealer = new DealerModel(dealer);
    await newDealer.save();
    res.json({
      status: "success",
      data: transformOutput(newDealer)
    });
  } catch (error) {
    next(new BadRequest(error));
  }
};

exports.updateDealerInfo = async (req, res, next) => {
  const { body, file } = req;
  const _id = req.params.id;
  const upd = { ...body };
  if (file) {
    const dealerObject = await DealerModel.findOne({ _id });
    await destroyImage(dealerObject.logo.publicId);
    const logo = await uploadImage(file, folderName);
    upd.logo = {
      src: logo.secure_url,
      publicId: logo.public_id
    };
  }
  try {
    await DealerModel.findOneAndUpdate({ _id }, upd);
    const dealer = await DealerModel.findOne({ _id });
    res.json({
      status: "success",
      data: transformOutput(dealer)
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteDealerInfo = async (req, res, next) => {
  const list = await DealerModel.find();
  const dealer = list[0];
  try {
    await DealerModel.findOneAndDelete({ _id: dealer._id });
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

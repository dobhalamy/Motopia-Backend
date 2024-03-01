const WarrantyModel = require("../models/warranty");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");
const { destroyImage } = require("../helpers/cloudinary");

const transformOutPut = blocks => {
  const transform = blocks
    .map(block => {
      const {
        _id,
        img,
        title,
        visible,
        mobileImg
      } = block;
      const { src } = img;
      const { mobileSrc } = mobileImg;
      return {
        _id,
        title,
        visible,
        src,
        mobileImg: mobileSrc
      };
    })
  return transform;
};

exports.warrantyList = async (req, res, next) => {
  try {
    const list = await WarrantyModel.find();
    if (list.length === 0)
      return next(new NotFound("No warranty images at database"));
    res.json({
      status: "success",
      data: transformOutPut(list)
    });
  } catch (error) {
    console.log(error);
    return next(new BadRequest(error));
  }
};

exports.visibleList = async (req, res, next) => {
  try {
    const list = await WarrantyModel.find({ visible: true });
    if (list.length === 0)
      return next(new NotFound("No visible warranty images at database"));
    res.json({
      status: "success",
      data: transformOutPut(list)
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.createWarranty = async (req, res, next) => {
  try {
    const { body: warranty } = req;

    const newWarranty = new WarrantyModel(warranty);
    await newWarranty.save();
    res.json({
      status: "success"
    });
  } catch (error) {
    next(new NotAllowed(error));
  }
};

exports.updateWarranty = async (req, res, next) => {
  try {
    const { body: upd } = req;
    const _id = req.params.id;
    const currentWarranty = await WarrantyModel.findOne({ _id });
    if (upd.img && upd.img.publicId) {
      if (!currentWarranty.img.src.includes('uploads')) {
        await destroyImage(currentWarranty.img.publicId)
      }
    }

    if (upd.mobileImg && upd.mobileImg.publicId) {
      if (!currentWarranty.mobileImg.mobileSrc.includes('uploads')) {
        await destroyImage(currentWarranty.mobileImg.publicId)
      }
    }
    await WarrantyModel.findByIdAndUpdate({ _id }, upd);
    
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteWarranty = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const delWarranty = await WarrantyModel.findOneAndDelete({ _id });
    await destroyImage(delWarranty.img.publicId);
    await destroyImage(delWarranty.mobileImg.publicId);
    if (delWarranty) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no warranty image with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

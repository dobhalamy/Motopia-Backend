const SvgModel = require("../models/vector-images");
const { BadRequest, NotAllowed } = require("../helpers/api_error");
const fs = require("fs");
const config = require("../../config");
const folderName = config.get("vectorFolder");

const { uploadHeroImage, destroyImage } = require("../helpers/cloudinary");

const transformOutPut = list => {
  const transform = list.map(svg => {
    const { img, main, stockId, _id } = svg;
    const { name, src } = img;
    return {
      _id,
      main,
      stockId,
      name,
      src
    };
  });
  return transform;
};

exports.svgList = async (req, res, next) => {
  try {
    const list = await SvgModel.find();
    if (list.length === 0)
      return next(new NotFound("No vector images at database"));
    const transformedList = transformOutPut(list);
    res.json({
      status: "success",
      data: transformedList
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.svgListByStockId = async (req, res, next) => {
  const { stockId } = req.params;
  try {
    const list = await SvgModel.find({ stockId });
    if (list.length === 0)
      return next(
        new NotFound("No vector images for this stockId at database")
      );
    const transformedList = transformOutPut(list);
    res.json({
      status: "success",
      data: transformedList
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.saveSvg = async (req, res, next) => {
  const { file, body } = req;
  const { stockId } = body;
  try {
    const imagesByStockId = await SvgModel.find({ stockId });
    if (imagesByStockId.length === 1) {
      const image = imagesByStockId[0];
      await SvgModel.findOneAndUpdate({ _id: image._id }, { main: false });
    }
    if (imagesByStockId.length === 2)
      return next(
        new BadRequest("There are already present 2 images for this stock ID")
      );
    const img = await uploadHeroImage(file, folderName, stockId);
    const template = {
      stockId,
      img: {
        src: img.secure_url,
        publicId: img.public_id
      }
    };
    const newSvg = new SvgModel(template);
    await newSvg.save();
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.updateSvg = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const imageBefore = await SvgModel.findOne({ _id });
    const upd = {
      main: !imageBefore.main
    };
    await SvgModel.updateMany(
      { stockId: imageBefore.stockId },
      { main: imageBefore.main }
    );
    await SvgModel.findOneAndUpdate({ _id }, upd);
    const list = await SvgModel.find({ stockId: imageBefore.stockId });
    res.json({
      status: "success",
      data: transformOutPut(list)
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteSvg = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const delSvg = await SvgModel.findOneAndDelete({ _id });
    const delImage = await destroyImage(delSvg.img.publicId);
    if (delSvg && delImage) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no finance pins with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

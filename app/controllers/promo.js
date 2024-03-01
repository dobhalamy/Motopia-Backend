const PromoModel = require('../models/promo-blocks');
const { BadRequest, NotAllowed, NotFound } = require('../helpers/api_error');
const { destroyImage } = require('../helpers/cloudinary');

const transformOutPut = blocks => {
  const transform = blocks
    .map(block => {
      const {
        _id,
        img,
        title,
        text,
        position,
        visible,
        linkText,
        linkPath,
        linkColor,
        background,
        textColor,
      } = block;
      const { src } = img;
      return {
        _id,
        title,
        text,
        position,
        visible,
        linkText,
        linkPath,
        linkColor,
        background,
        textColor,
        src,
      };
    })
    .sort((a, b) => a.position > b.position);
  return transform;
};

exports.promoList = async (req, res, next) => {
  try {
    const list = await PromoModel.find();
    if (list.length === 0)
      return next(new NotFound('No promo blocks at database'));
    res.json({
      status: 'success',
      data: transformOutPut(list),
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.visibleList = async (req, res, next) => {
  try {
    const list = await PromoModel.find({ visible: true });
    if (list.length === 0) {
      return next(new NotFound('No visible promo blocks at database'));
    }
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: 'success',
      data: transformOutPut(list),
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.createPromo = async (req, res, next) => {
  try {
    const { body: promo } = req;
    const newPromo = new PromoModel(promo);
    const savePromo = await newPromo.save();
    if (savePromo) {
      res.json({
        status: 'success',
      });
    } else return next(new BadRequest("Can't create promo block"));
  } catch (error) {
    next(new NotAllowed(error));
  }
};

exports.updatePromo = async (req, res, next) => {
  const { body: upd } = req;
  const _id = req.params.id;
  if (upd.img && upd.img.publicId) {
    try {
      const currentPromo = await PromoModel.findOne({ _id }).lean();
      if (!currentPromo.img.src.includes('uploads')) {
        await destroyImage(currentPromo.img.publicId)
      }
    } catch (error) {
      console.error(error.message || error);
    }
  }
  try {
    const updPromo = await PromoModel.findOneAndUpdate({ _id }, upd);
    if (updPromo) {
      res.json({
        status: 'success',
      });
    } else return next(new NotFound('There is no promo block with such id'));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deletePromo = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const delPromo = await PromoModel.findOneAndDelete({ _id });
    await destroyImage(delPromo.img.publicId);
    if (delPromo) {
      res.json({
        status: 'success',
      });
    } else return next(new NotFound('There is no promo block with such id'));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

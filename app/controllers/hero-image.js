const HeroModel = require("../models/hero-image");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");
const config = require("../../config");
const { destroyImage } = require("../helpers/cloudinary");

const transformOutPut = blocks => {
  const transform = blocks
    .map(block => {
      const {
        _id,
        img,
        title,
        text,
        visible,
        linkPath,
        mobileImg
      } = block;
      const { src } = img;
      const { mobileSrc } = mobileImg;
      return {
        _id,
        title,
        text,
        visible,
        linkPath,
        src,
        mobileSrc
      };
    })
  return transform;
};

exports.heroList = async (req, res, next) => {
  try {
    const list = await HeroModel.find();
    if (list.length === 0)
      return next(new NotFound("No hero images at database"));
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
    const list = await HeroModel.find({ visible: true });
    if (list.length === 0) {
      return next(new NotFound("No visible hero images at database"));
    }
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: "success",
      data: transformOutPut(list)
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.createHero = async (req, res, next) => {
  try {
    const { body: hero } = req;
    const newHero = new HeroModel(hero);
    const saveHero = await newHero.save();
    if (saveHero) {
      res.json({
        status: "success"
      });
    } else return next(new BadRequest("Can't save hero image"));
  } catch (error) {
    next(new NotAllowed(error));
  }
};

exports.updateHero = async (req, res, next) => {
  try {
    const { body: upd } = req;
    const _id = req.params.id;
    const currentHeroImage = await HeroModel.findOne({ _id }).lean();
    
    if (upd.img && upd.img.publicId) {
      if (!currentHeroImage.img.src.includes('uploads')) {
        await destroyImage(currentHeroImage.img.publicId)
      }
    }

    if (upd.mobileImg && upd.mobileImg.publicId) {
      if (!currentHeroImage.img.src.includes('uploads')) {
        await destroyImage(currentHeroImage.mobileImg.publicId)
      }
    }
    await HeroModel.findByIdAndUpdate({ _id }, upd);
    
    res.json({
      status: "success"
    });
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteHero = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const delHero = await HeroModel.findOneAndDelete({ _id });
    await destroyImage(delHero.img.publicId);
    await destroyImage(delHero.mobileImg.publicId);
    if (delHero) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no hero image with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

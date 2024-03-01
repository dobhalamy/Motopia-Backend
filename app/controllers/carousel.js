const CarouselModel = require("../models/carousel");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");
const { destroyImage } = require("../helpers/cloudinary");

exports.carouselList = async (req, res, next) => {
  const list = await CarouselModel.find();
  if (list) {
    res.set('Cache-control', 'public, max-age=1800');
    res.json({
      status: "success",
      data: list,
    });
  } else return next(new BadRequest("Can't get carousel list"));
};

exports.createCarousel = async (req, res, next) => {
  const carousel = req.body;
  const newCarousel = new CarouselModel(carousel);
  try {
    const saveCarousel = await newCarousel.save();
    if (saveCarousel) {
      res.json({
        status: "success",
      });
    }
  } catch (error) {
    next(new BadRequest(error));
  }
};

exports.deleteCarousel = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const deletedCarousel = await CarouselModel.findOneAndDelete({ _id });
    await destroyImage(deletedCarousel.image.publicId);
    await destroyImage(deletedCarousel.mobileImage.publicId);
    await Promise.all(deletedCarousel.subCategories
      .filter(subCat => subCat.logoImage && subCat.logoImage.publicId)
      .map(subCat => destroyImage(subCat.logoImage.publicId))
    );
    if (deletedCarousel) {
      res.json({
        status: "success",
      });
    }
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.getCarouselById = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const carousel = await CarouselModel.find({ _id });
    console.log(carousel, "carousel");
    res.json({
      status: "success",
      data: carousel,
    });
  } catch (error) {
    return next(new BadRequest(error));
  }
};

exports.updateCarousel = async (req, res, next) => {
  try {
    const { body } = req;
    const _id = req.params.id;
    const currentCarousel = await CarouselModel.findOne({ _id });
    const currentImagePublicId = currentCarousel.image.publicId;
    const currentMobileImagePublicId = currentCarousel.mobileImage.publicId;

    if (body.image && body.image.publicId && body.image.publicId !== currentImagePublicId) {
      await destroyImage(currentImagePublicId);
    }

    if (body.mobileImage && body.mobileImage.publicId && body.mobileImage.publicId !== currentMobileImagePublicId) {
      await destroyImage(currentMobileImagePublicId);
    }

    const updateCarousel = await CarouselModel.findOneAndUpdate({ _id }, body, { new: true }).lean();
    if (updateCarousel) {
      res.json({
        status: "success",
        data: updateCarousel,
      });
    } else return next(new NotFound("There is no carousel  with such id"));
  } catch (error) {
    next(new NotFound(error));
  }
};

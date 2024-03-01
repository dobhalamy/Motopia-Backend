const LifeStyleModel = require("../models/lifestyle");
const {
  BadRequest,
  NotAllowed,
  InternalServerError,
  NotFound
} = require("../helpers/api_error");
const config = require("../../config");
const { getJWToken } = require("./auth");

exports.lifeStyleCategorysList = async (req, res, next) => {
  const categoryData  = req.params.selectedValue;
  const list = await LifeStyleModel.find({category:categoryData});
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get Categorys list"));
};

exports.updateLifeStyleCategory = async (req, res, next) => {
    const newData=req.body.categoryData;
  try {
    const _id=newData._id;
    const savedData=await LifeStyleModel.findOneAndUpdate({ _id }, newData)
    if (savedData) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no Category with such id"));
  } catch (error) {
    next(new InternalServerError(error));
  }
};

exports.createLifeStyleCategory = async (req, res, next) => {
  const categoryData  = req.body.categoryData;
  const newcategoryData = new LifeStyleModel(categoryData);
  try {
    const saveCategory = await newcategoryData.save();
    if (saveCategory) {
      res.json({
        status: "success",
      });
    }
  } catch (error) {
    console.error(error);
    next(
      new BadRequest(
        "Can't create lifestyle description"
      )
    );
  }
};

exports.deleteLifeStyleCategory = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const deleteCategory = await LifeStyleModel.findOneAndDelete({ _id });
    if (deleteCategory) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no Category with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.getDescriptionByCategory = async (req, res, next) => {
  const categoryData  = req.params.selectedCategory;
  const list = await LifeStyleModel.find({category:categoryData});
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get description"));
};
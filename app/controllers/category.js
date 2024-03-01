const CategoryModel = require("../models/category");
const {
  BadRequest,
  NotAllowed,
  InternalServerError,
  NotFound
} = require("../helpers/api_error");
const config = require("../../config");
const { getJWToken } = require("./auth");
const bcrypt = require("bcrypt");

exports.CategorysList = async (req, res, next) => {
  const categoryData  = req.params.selectedValue;
  const list = await CategoryModel.find({category:categoryData});
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get Categorys list"));
};

exports.updateCategory = async (req, res, next) => {
    const newData=req.body;
  try {
    const oldData = await CategoryModel.findOne({ _id: req.body._id });
    // const { email } = req.body;
    // const existUser = await CategoryModel.findOne({ email });

    // if (existUser)
    //   return next(new NotAllowed("The user with such email already exist."));

    // const model = new CategoryModel(req.body);
    // const newUser = await model.save();
    // const token = getJWToken(newUser);
    // sgMail.setApiKey(config.get("SENDGRID_KEY"));
    // const msg = {
    //   to: email,
    //   from: user.email,
    //   templateId: "d-b551ff53ca1e468da3b1fba07119fc8b",
    //   dynamic_template_data: {
    //     link: `https://Category.gomotopia.com/resetpass?token=${token}`
    //   }
    // };
    // res.json({ status: "success" });
  } catch (error) {
    next(new InternalServerError(error));
  }
};

exports.createCategory = async (req, res, next) => {
  const categoryData  = req.body.categoryData;
  const categoryExist = await CategoryModel.find({category:categoryData.category}).lean();
  try {
    let savedData;
    if(categoryExist.length>0){
      const _id=categoryExist[0]._id
      savedData=await CategoryModel.findOneAndUpdate({ _id }, categoryData)
    }
    else{
      const newcategoryData = new CategoryModel(categoryData);
      savedData = await newcategoryData.save();
    }
    if (savedData) {
      res.json({
        status: "success",
      });
    }
  } catch (error) {
    console.error(error);
    next(
      new BadRequest(
        "Can't set password. Unexpected error. Please contact developers."
      )
    );
  }
};

exports.deleteCategory = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const deleteCategory = await CategoryModel.findOneAndDelete({ _id });
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
  const list = await CategoryModel.find({category:categoryData}).lean();
  if (list) {
    res.json({
      status: "success",
      data: list.length>0 ? list[0].description : ""
    });
  } else return next(new BadRequest("Can't get description"));
};
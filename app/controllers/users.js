const UserModel = require("../models/cms-users");
const {
  BadRequest,
  NotAllowed,
  InternalServerError,
  NotFound
} = require("../helpers/api_error");
const config = require("../../config");
const sgMail = require("@sendgrid/mail");
const { getJWToken } = require("./auth");
const bcrypt = require("bcrypt");

exports.adminsList = async (req, res, next) => {
  const list = await UserModel.find();
  if (list) {
    res.json({
      status: "success",
      data: list
    });
  } else return next(new BadRequest("Can't get admins list"));
};

exports.inviteAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ _id: req.user._id });
    const { email } = req.body;
    const existUser = await UserModel.findOne({ email });

    if (existUser)
      return next(new NotAllowed("The user with such email already exist."));

    const model = new UserModel(req.body);
    const newUser = await model.save();
    const token = getJWToken(newUser);
    sgMail.setApiKey(config.get("SENDGRID_KEY"));
    const msg = {
      to: email,
      from: user.email,
      templateId: "d-b551ff53ca1e468da3b1fba07119fc8b",
      dynamic_template_data: {
        link: `https://admin.gomotopia.com/resetpass?token=${token}`
      }
    };
    sgMail.send(msg);
    res.json({ status: "success" });
  } catch (error) {
    next(new InternalServerError(error));
  }
};

exports.createAdmin = async (req, res, next) => {
  const { password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { password: hash }
    );
    res.json({
      status: "success",
      user: {
        _id: user._id,
        status: user.status,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    next(
      new BadRequest(
        "Can't set password. Unexpected error. Please contact developers."
      )
    );
  }
};

// exports.updateAdmin = async (req, res, next) => {};

exports.deleteAdmin = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const deleteUser = await UserModel.findOneAndDelete({ _id });
    if (deleteUser) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no admin with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

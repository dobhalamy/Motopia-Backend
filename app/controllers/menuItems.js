const MenuModel = require("../models/menu-items");
const { BadRequest, NotFound } = require("../helpers/api_error");

exports.menuList = async (req, res, next) => {
  try {
    const list = await MenuModel.find();
    if (list.length === 0)
      return next(new NotFound("No menu items found"));
    res.json({
      status: "success",
      data: list
    });
  } catch (error) {
    console.log(error);
    return next(new BadRequest(error));
  }
};

exports.createMenu = async (req, res, next) => {
  try {
    const { data } = req.body;
    const newitem = new MenuModel(data);
    const saveMenuItem = await newitem.save();
    if (saveMenuItem) {
      res.json({
        status: "success"
      });
    } else return next(new BadRequest("Can't save menu item"));
  } catch (error) {
    next(new NotAllowed(error));
  }
};

exports.updateMenu = async (req, res, next) => {
  const data = req.body;
  const _id = data._id;
  try {
    const updHero = await MenuModel.findOneAndUpdate({ _id }, data);
    if (updHero) {
      res.json({
        status: "success"
      });
    } else return next(new NotFound("There is no menu item with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

exports.deleteMenu = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const delHero = await MenuModel.findOneAndDelete({ _id });
    if (delHero) {
      res.json({
        status: "deleted"
      });
    } else return next(new NotFound("There is no menu item with such id"));
  } catch (error) {
    return next(new NotAllowed(error));
  }
};

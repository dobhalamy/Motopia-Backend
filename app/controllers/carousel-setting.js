const carouselSettingModel = require("../models/carousel-setting");
const { BadRequest, NotAllowed, NotFound } = require("../helpers/api_error");

exports.createCarouselSetting = async (req, res, next) => {
    const settings = req.body;
    const newCarouselSetting = new carouselSettingModel(settings);
    try {
        const saveCarouselSetting = await newCarouselSetting.save();
        if (saveCarouselSetting) {
            res.json({
                status: "success",
            });
        }
    } catch (error) {
        next(new BadRequest(error));
    }
};

exports.carouselSettingList = async (req, res, next) => {
    const carouselSetting = await carouselSettingModel.findOne();
    if (carouselSetting) {
        res.json({
            status: "success",
            data: carouselSetting,
        });
    } else return next(new BadRequest("Can't get carousel settings"));
};


exports.updateCarouselSetting = async (req, res, next) => {
    try {
        const body = req.body;
        const carouselSetting = await carouselSettingModel.findOne();
        const { _id } = carouselSetting
        const updateCarouselSetting = await carouselSettingModel.findOneAndUpdate({ _id }, body);
        const newCarouselSetting = await carouselSettingModel.findOne({ _id });
        if (updateCarouselSetting) {
            res.json({
                status: "success",
                data: newCarouselSetting,
            });
        } else return next(new NotFound("There is no carousel setting with such id"));
    } catch (error) {
        next(new NotFound(error));
    }
};

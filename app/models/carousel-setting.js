const mongoose = require("mongoose");
const { Schema } = mongoose;

const requiredStringDefObj = {
    type: String,
};

const carouselSettingSchema = new Schema({
    backgroundColor: requiredStringDefObj,
    textColor: requiredStringDefObj,
    sliderSpeed: {
        type: Number,
    },
});

const carouselSetting = mongoose.model("carousel-setting", carouselSettingSchema);

module.exports = carouselSetting;

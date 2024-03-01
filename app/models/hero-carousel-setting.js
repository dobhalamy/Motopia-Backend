const mongoose = require("mongoose");
const { Schema } = mongoose;

const requiredStringDefObj = {
    type: String,
};

const heroCarouselSettingSchema = new Schema({
    backgroundColor: requiredStringDefObj,
    textColor: requiredStringDefObj,
    sliderSpeed: {
        type: Number,
    },
});

const heroCarouselSetting = mongoose.model("hero-carousel-setting", heroCarouselSettingSchema);

module.exports = heroCarouselSetting;

const mongoose = require("mongoose");
const { Schema } = mongoose;

const LifeStyleSchema = new Schema(
    {
        category: {
            type: String,
            default: "",
            required: true
        },
        description: {
            type: String,
            trim: true,
            default: "",
            required: true
        },
    }
);

const LifeStyle = mongoose.model("lifestyle", LifeStyleSchema);
module.exports = LifeStyle;

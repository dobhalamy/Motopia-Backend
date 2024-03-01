const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
    {
        category: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
    }
);

const Category = mongoose.model("category", CategorySchema);
module.exports = Category;

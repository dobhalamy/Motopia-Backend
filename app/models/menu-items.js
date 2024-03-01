const mongoose = require("mongoose");
const { Schema } = mongoose;

const menuItemsSchema = new Schema({
  title: {
    type: String
  },
  linkPath: {
    type: String
  },
}, {
  versionKey: false
});

const MenuItems = mongoose.model("menu-items", menuItemsSchema);

module.exports = MenuItems;

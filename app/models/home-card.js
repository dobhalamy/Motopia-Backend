const mongoose = require("mongoose");
const { Schema } = mongoose;

const HomeCardSchema = new Schema({
  title: {
    type: String
  },
  icon: {
    publicId: String,
    src: {
      type: String
    }
  },
  links: [
    {
      name: String,
      link: String
    }
  ],
  mainLink: String,
  position: Number
}, {
  versionKey: false
});

const HomeCard = mongoose.model("home-card", HomeCardSchema);

module.exports = HomeCard;

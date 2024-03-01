const mongoose = require("mongoose");
const { Schema } = mongoose;

const promoBlockSchema = new Schema({
  title: {
    type: String
  },
  text: {
    type: String
  },
  position: {
    type: Number
  },
  visible: {
    type: Boolean,
    default: false
  },
  img: {
    publicId: String,
    src: {
      type: String,
      required: [true, "Miss Dealer's logo src"]
    }
  },
  linkText: {
    type: String
  },
  linkPath: {
    type: String
  },
  linkColor: {
    type: String,
    default: "#001C5E"
  },
  background: {
    type: String,
    default: "transparent"
  },
  textColor: {
    type: String,
    default: "#4E4E51"
  }
}, {
  versionKey: false
});

const PromoBlock = mongoose.model("Promo-block", promoBlockSchema);

module.exports = PromoBlock;

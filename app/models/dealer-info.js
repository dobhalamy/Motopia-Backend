const mongoose = require("mongoose");
const { Schema } = mongoose;

const dealerInfoSchema = new Schema({
  name: {
    type: String,
    required: [true, "Miss Dealer's Name"]
  },
  phone: {
    type: String,
    required: [true, "Miss Dealer's Phone number"]
  },
  logo: {
    publicId: String,
    src: {
      type: String,
      required: [true, "Miss Dealer's logo src"]
    }
  },
  address: {
    type: String,
    required: [true, "Miss Dealer's Address information"]
  }
}, {
  versionKey: false
});

const DealerInfo = mongoose.model("Dealer-info", dealerInfoSchema);

module.exports = DealerInfo;

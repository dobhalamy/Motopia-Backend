const mongoose = require("mongoose");
const { Schema } = mongoose;

const AmountJobModel = require('./approved-jobs');

const approvedAmountSchema = new Schema({
  dmsUserId: {
    type: String,
    required: [true, "Miss UserID from DMS for saving approved amount"],
    unique: true
  },
  amount: {
    type: Number,
    required: [true, "Miss Amount for saving approved amount"]
  },
  creditAppId: Number,
  downPayment: Number,
  saveDate: {
    type: Date,
    required: [true, "Miss Saving Date for saving approved amount"]
  },
  expDate: {
    type: Date,
    required: [true, "Miss Expire Date for saving approved amount"]
  }
}, {
  versionKey: false
});

approvedAmountSchema.pre('deleteOne', async function(next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
      await AmountJobModel.deleteOne({ name: String(doc._id) });
  }
  next();
});

const ApprovedAmount = mongoose.model("Approved-Amount", approvedAmountSchema);

module.exports = ApprovedAmount;

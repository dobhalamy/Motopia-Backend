const mongoose = require("mongoose");
const { Schema } = mongoose;

const ApprovedAmountJobSchema = new Schema({
  name: String,
  date: Date,
}, { 
  versionKey: false,
  timestamps: true
});

const Job = mongoose.model("approved-job", ApprovedAmountJobSchema);

module.exports = Job;
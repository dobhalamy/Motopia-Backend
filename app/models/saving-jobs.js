const mongoose = require("mongoose");
const { Schema } = mongoose;

const SavingJobSchema = new Schema({
  name: String,
  date: Date,
}, { 
  versionKey: false,
  timestamps: true
});

const Job = mongoose.model("saving-job", SavingJobSchema);

module.exports = Job;
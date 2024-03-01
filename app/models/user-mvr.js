const mongoose = require("mongoose");
const { Schema } = mongoose;

const userReportSchema = new Schema({
    dmsUserId: {
      type: String,
      required: [true, "Miss UserID from DMS for saving approved amount"],
      unique: true
    },
    creditRdsId: Number,
    file: String,
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

const ReportModel = mongoose.model("MVR-report", userReportSchema);

module.exports = ReportModel;
const mongoose = require("mongoose");
const { Schema } = mongoose;

const rdsCompanies = new Schema(
  {
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const RDSCompany = mongoose.model("rds-company", rdsCompanies);

module.exports = RDSCompany;

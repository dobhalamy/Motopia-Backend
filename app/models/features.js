const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubFeatureSchema = new Schema({
  featureId: Number,
  featureName: String,
  featureDesc: String
}, { _id: false })

const SubRoomSchema = new Schema({
  frontHeadRoom: Number,
  frontLegRoom: Number,
  rearHeadRoom: Number,
  rearLegRoom: Number
}, { _id: false })

const CarfaxSchema = new Schema({
  accidentHighlight: String,
  inServiceDate: String,
  maintenanceRec: Number,
  oneOwner: String,
  otherHeighlights: String,
  ownerCount: Number,
  personalUse: String,
  registeredState: String,
  stickerFIleName: String,
  wellMaintained: String,
  highlights: String
}, { _id: false })

const FeatureSchema = new Schema({
  stockid: {
    type: Number,
    index: true,
    unique: true
  },
  features: [SubFeatureSchema],
  possibleFeatures: [SubFeatureSchema],
  installedPossibleFeatures: Array,
  invWarranties: Array,
  invHeadroom: [SubRoomSchema],
  carfax: CarfaxSchema
}, {
  versionKey: false
});

const Feature = mongoose.model("feature", FeatureSchema);
module.exports = Feature;

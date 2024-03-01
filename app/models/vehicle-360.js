const mongoose = require("mongoose");
const { generateAndSaveXML } = require("../helpers/generateXML");
const { Schema } = mongoose;

const Vehicle360Schema = new Schema({
  stockid: {
    type: String,
    index: true,
    unique: true,
  },
  make: String,
  model: String,
  defaultPicture: String,
  degree20: [{
    _id: false,
    pic: String,
    lowRes: String
  }],
  degree45: [{
    _id: false,
    pic: String,
    lowRes: String
  }],
  degree60: [{
    _id: false,
    pic: String,
    lowRes: String
  }],
  xml: {
    type: Schema.Types.ObjectId,
    ref: 'Web-360-xml-config',
  },
  exteriorHotspots: [
    {
      _id: false,
      id: String,
      description: String,
      title: String,
      offsetX: Number,
      offsetY: Number,
      picture: String,
      imageIndexList: [Number],
      rowIndex: Number,
      type: {
        type: String,
        enum: ["DAMAGE", "FEATURE", "POSSIBLE FEATURE", "INSTALLED FEATURE"]
      },
    }
  ],
  interiorHotspots: [
    {
      _id: false,
      id: String,
      pitch: Number,
      yaw: Number,
      type: { type: String, default: 'custom' },
      createTooltipArgs: {
        title: String,
        description: String,
        picture: String,
        type: {
          type: String,
          enum: ["DAMAGE", "FEATURE", "POSSIBLE FEATURE", "INSTALLED FEATURE"]
        },
      }
    }
  ]
}, {
  versionKey: false,
});

Vehicle360Schema.pre('save', async function(next) {
  const config = this;
  try {
    config.xml = await generateAndSaveXML(config);
    next();
  } catch (error) {
    console.error(error);
    next();
  }
})


const Vehicle360 = mongoose.model("Vehicle-360", Vehicle360Schema);

module.exports = Vehicle360;

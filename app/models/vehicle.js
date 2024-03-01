const mongoose = require('mongoose');
const PinModel = require('./vehicle-pins');
const FeatureModel = require('./features');
const moment = require('moment');
const { Schema } = mongoose;

const VehicleSchema = new Schema(
  {
    stockid: {
      type: Number,
      index: true,
      unique: true,
    },
    stockType: String,
    styleId: String,
    batteryRange: Number,
    condition: String,
    vin: String,
    make: String,
    carYear: Number,
    carBody: String,
    dmsCarBody: String,
    model: String,
    series: String,
    mileage: Number,
    exteriorColor: String,
    interiorColor: String,
    fuelType: String,
    cylinder: String,
    warranty: String,
    seating: String,
    specialAmenities4: String,
    baseImageUrl: String,
    picturesUrl: [
      new Schema({
        picture: String,
        pin: {
          type: Schema.Types.ObjectId,
          ref: 'Vehicle-Pin',
        },
        name: String,
      }),
    ],
    rideShareCategory: String,
    rideShareDesc: String,
    lifeStyleCategory: String,
    lifeStyleDesc: String,
    features: {
      type: Schema.Types.ObjectId,
      ref: 'feature',
    },
    availabilityStatus: String,
    listPrice: Number,
    possibleFeatures: String,
    mpg: {
      city: {
        low: String,
        high: String,
      },
      hwy: {
        low: String,
        high: String,
      },
    },
    drivetrain: String,
    oemExt: String,
    oemInt: String,
    lifeStyleCategory: String,
    lifeStyleDesc: String,
    rideShareCategory: String,
    rideShareDesc: String,
    rimSize: Number,
    purchaseDate: Date,
    active: {
      type: Boolean,
      default: true,
    },
    eBrochureLink: String,
    carfaxHighlight: String,
    carfaxReport: String,
    isCarfax: Boolean,
    isCarfaxSticker: Boolean,
    isLifeTimeWarranty: Boolean,
    is360: Boolean,
    seoTags: Object,
    markForDeletion: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

VehicleSchema.pre('save', async function () {
  const vehicle = this;
  const { picturesUrl } = vehicle;
  const pins = await PinModel.find({
    stockId: vehicle.stockid,
  });
  if (picturesUrl.length > 0) {
    picturesUrl.map(pic => {
      try {
        const array = pic.picture.split('/');
        pic.name = array[array.length - 1];
        const pin = pins.filter(el => el.picture === pic.name)[0];
        if (pin) {
          pic.pin = pin._id;
          return pic;
        }
        return pic;
      } catch (error) {
        console.error(error);
      }
    });
  }
});

VehicleSchema.pre('findOneAndUpdate', async function (next) {
  const vehicle = this.getUpdate();
  const { picturesUrl } = vehicle;
  const pins = await PinModel.find({
    stockId: vehicle.stockid,
  });
  if (!picturesUrl) {
    console.log(`NO PICTURES FOR ${vehicle.stockid}`);
    next();
  }
  if (picturesUrl && picturesUrl.length > 0) {
    picturesUrl.map((pic, i) => {
      try {
        const array = pic.picture.split('/');
        this._update.picturesUrl[i].name = array[array.length - 1];
        const pin = pins.filter(el => el.picture === pic.name)[0];
        if (pin) {
          pic.pin = pin._id;
          return pic;
        }
        return pic;
      } catch (error) {
        console.error(error);
      }
    });
  }
  next();
});

VehicleSchema.post('findOneAndRemove', async function (doc) {
  if (doc) {
    await FeatureModel.findOneAndDelete({ _id: doc.features });
  }
});

const Vehicle = mongoose.model('vehicle', VehicleSchema);
module.exports = Vehicle;

const { Schema, model } = require('mongoose');

const scheduleSchema = new Schema({
	isVehicleSyncActive: {
    type: Boolean,
    default: false,
  },
}, {
	versionKey: false,
	timestamps: true,
});
const Resender = model('Schedule', scheduleSchema, 'Schedules');
module.exports = Resender;
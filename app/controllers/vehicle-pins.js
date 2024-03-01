const PinModel = require('../models/vehicle-pins');
const VehicleModel = require('../models/vehicle');
const { BadRequest, NotAllowed, NotFound } = require('../helpers/api_error');

exports.pinsList = async (req, res, next) => {
	try {
		const list = await PinModel.find();
		if (list.length === 0) {return next(new NotFound('No vehicle pins at database'));}
		res.json({
			status: 'success',
			data: list,
		});
	} catch (error) {
		return next(new BadRequest(error));
	}
};

exports.pinsListByStockId = async (req, res, next) => {
	const stockId = req.params.stockId;
	try {
		const car = await PinModel.find({ stockId });
		res.json({
			status: 'success',
			data: car,
		});
	} catch (error) {
		return next(new BadRequest(error));
	}
};

exports.createVehiclePin = async (req, res, next) => {
	try {
		const { picture, pin } = req.body;
		const vehicle = await VehicleModel.findOne({ stockid: pin.stockId });
		const img = await vehicle.picturesUrl.id(picture);
		pin.picture = img.name;
		const newVehiclePin = new PinModel(pin);
		const newPin = await newVehiclePin.save();
		img.pin = newPin._id;
		const saveVehicle = await vehicle.save();
		if (newPin && saveVehicle) {
			res.json({
				status: 'success',
			});
		} else {return next(new BadRequest("Can't create vehicle pin"));}
	} catch (error) {
		console.error(error);
		if (error.name && error.name === 'ValidationError') {
			next(new BadRequest(error.message));
		} else {next(new NotAllowed(error));}
	}
};

// exports.addNewPinsToStockId = async (req, res, next) => {
//   try {
//     const { stockId } = req.params;
//     const { areas, description } = req.body;
//     const existingCar = await PinModel.findOne({ stockId });

//     if (!existingCar) {
//       return next(new NotFound("There is no vehicle pins with such id"));
//     }
//     if (existingCar.stockId !== stockId) {
//       return next(new BadRequest("Wrong stockId or _id for this data."));
//     }

//     for (let i = 0; i < areas.length; i++) {
//       const area = areas[i];
//       const desc = description[i];

//       existingCar.areas.push(area);
//       existingCar.description.push(desc);
//     }

//     await existingCar.save();

//     res.json({
//       status: "success"
//     });
//   } catch (error) {
//     next(new NotAllowed(error));
//   }
// };

exports.updateVehiclePin = async (req, res, next) => {
	try {
		const { picture, pin } = req.body;
		const { stockId } = pin;
		const updatePin = await PinModel.findOneAndUpdate({ stockId, picture }, { ...pin });
		if (updatePin) {
			res.json({
				status: 'success',
			});
		} else {return next(new NotFound('There is no vehicle pins with such id'));}
	} catch (error) {
		next(new NotAllowed(error));
	}
};

exports.deleteVehiclePin = async (req, res, next) => {
	try {
		const { stockId, picture } = req.params;
		const deletedPin = await PinModel.findOneAndDelete({
			stockId,
			picture,
		});
		if (deletedPin) {
			res.json({
				status: 'success',
			});
		} else {return next(new NotFound('There is no vehicle pins with such id'));}
	} catch (error) {
		next(new NotAllowed(error));
	}
};

// exports.removeSomePin = async (req, res, next) => {
//   try {
//     const { stockId, name } = req.params;
//     const existingCar = await PinModel.findOne({ stockId });
//     const { areas, description } = existingCar;
//     const newAreas = areas.filter(area => area.name !== name);
//     const newDesc = description.filter(desc => desc.id !== name);
//     existingCar.areas = newAreas;
//     existingCar.description = newDesc;
//     await existingCar.save();

//     res.json({
//       status: "success"
//     });
//   } catch (error) {
//     console.error(error);
//     next(new NotAllowed(error));
//   }
// };

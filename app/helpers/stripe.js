const config = require('../../config');
const stripe = require('stripe')(config.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY);
const carModel = require('../models/vehicle');

exports.createPayment = async (payment, customer) => {
	const {
		amount,
		description,
		email,
		stockId,
		prospectId,
		rsdStockId,
		type,
		img,
		pickupLocation,
		pickupDate,
		vehicleInfo,
		plateInfo,
		downPayment,
		monthlyPayment,
		term,
		isRetail,
		flow,
		pickMethod } = payment;
	const convertAmount = amount * 100;
	try {
		if (type === 'finance') {
			const vehicle = await carModel.findOne({ stockid: stockId });
			const images = vehicle.picturesUrl.map((obj) => obj.picture);
			const picture = images[0].replace('http://', 'https://');
			const vin = flow === 'deal' ? 'To be confirmed' : vehicle.vin;
			const total = vehicle.listPrice - downPayment;
			const baseMeta = { stockId, prospectId, picture, pickupLocation, pickupDate, vin, pickMethod }
			const metadata = isRetail
				? baseMeta
				: { ...baseMeta, total, downPayment, monthlyPayment, term }
			const paymentIntent = await stripe.paymentIntents.create({
				amount: convertAmount,
				currency: 'usd',
				description,
				receipt_email: email,
				customer: customer.id,
				metadata
			});
			const response = {
				paymentIntent,
				picture,
				vehicle
			};
			return response;
		}
		if (type === 'rds') {
			const paymentIntent = await stripe.paymentIntents.create({
				amount: convertAmount,
				currency: 'usd',
				description,
				receipt_email: email,
				customer: customer.id,
				metadata: {
					rsdStockId,
					prospectId,
					picture: img,
					pickupLocation,
					pickupDate,
					vehicleInfo,
					plateInfo,
					pickMethod
				}
			});
			const response = {
				paymentIntent,
			};
			return response;
		}
		
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};

exports.checkCustomer = async (email) => {
	try {
		const reposnse = await stripe.customers.list({ email });
		const list = reposnse.data;
		return list;
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};

exports.createCustomer = async (email, prospectId) => {
	try {
		const customer = await stripe.customers.create({
			email,
			metadata: {
				prospectId
			}
		});
		return customer;
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};

exports.getCustomer = async (id) => {
	try {
		const customer = await stripe.customers.retrieve(id);
		return customer;
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};

const { BadRequest } = require('../helpers/api_error');
const { createCustomerProfile, checkCustomer, chargeCreditCard, generateReceipt } = require('../helpers/authorize');

exports.createCustomer = async (req, res, next) => {
	const { body } = req.body;
	try {
        const customerExist = await checkCustomer(body.email);
        if (customerExist.resultCode === 'Error') {
	        const customerProfile = await createCustomerProfile(body.email);
        }
		res.json();
	} catch (error) {
		console.error(error);
		next(new BadRequest(error));
	}
};

exports.chargeCreditCard = async (req, res, next) => {
	const { params } = req.body;
	try {
		const isProcessed = await chargeCreditCard(params);
		if (isProcessed.isSuccess) {
			const { message, resultCode } = isProcessed.data.messages;
			const response = message[0];
			if (resultCode == 'Ok') {
				console.info('data', response.text);
				res.json({
					status: "success",
					data: isProcessed
				});
			} else {
				res.json({
					status: "unSuccessfull",
					data: response
				});
			}
		} else {
			res.json({
				status: "unSuccessfull",
				message: isProcessed.message
			});
		}
		
	} catch (error) {
		console.error(error);
		next(new BadRequest(error));
	}
};

exports.sendReceipt = async (req, res, next) => {
	const { params } = req.body;
	try {
		const isSent = await generateReceipt(params);
		if (isSent != null) {
			res.json({
				status: "Successfull",
			});
		} else {
			res.json({
				status: "unSuccessfull",
			});
		}
		
	} catch (error) {
		console.error(error);
		next(new BadRequest(error));
	}
};
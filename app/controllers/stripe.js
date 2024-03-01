const { BadRequest } = require('../helpers/api_error');
const { createSession, createPayment, checkCustomer, createCustomer, getCustomer } = require('../helpers/stripe');
const config = require('../../config');
const sgMail = require("@sendgrid/mail");

exports.createCheckout = async (req, res, next) => {
	const { body } = req;
	try {
		const session = await createSession(body);
		res.json(session);
	} catch (error) {
		console.error(error);
		next(new BadRequest(error));
	}
};

exports.paymentRequset = async (req, res, next) => {
	const { payment } = req.body;
	const { email, prospectId } = payment;
	try {
		let customer;
		const customersList = await checkCustomer(email);
		if (customersList.length === 0) {
			customer = await createCustomer(email, prospectId);
		} else {
			customer = await getCustomer(customersList[0].id);
		}
		const intent = await createPayment(payment, customer);
		res.json(intent);
	} catch (error) {
		console.error(error);
		next(new BadRequest(error));
	}
};

const generateReceipt = async payment => {
	try {
		const { description, metadata, receipt_email } = payment;
		const fromEmail = 'sales@gomotopia.com';
		const motopiaEmail = 'purchase@gomotopia.com';
		const charge = payment.charges.data[0];
		const { id, payment_method_details, billing_details } = charge;
		const { brand, last4 } = payment_method_details.card;
		const { name } = billing_details;
		const {
			prospectId,
			pickupLocation,
			pickupDate,
			picture,
			vehicleInfo,
			plateInfo,
			total,
			downPayment,
			monthlyPayment,
			term,
			vin,
      stockId,
      pickMethod
    } = metadata;
		const isDelivery = pickMethod === 'Delivery';
		const currency = payment.currency.toUpperCase();
		const amount = `${payment.amount / 100} ${currency}`;
		const paymentMethod = `${brand.toUpperCase()} ****${last4}`;
		const baseEmail = {
			dealType: description,
			pickLoc: pickupLocation,
			pickDate: pickupDate,
			prospectId,
			txnId: id,
			amount,
			paymentMethod,
      picture,
      isDelivery
		};

		if (description === 'Financing (Car)' || description === 'Financing (Deal)') {
			sgMail.setApiKey(config.get("SENDGRID_KEY"));
    	const mail = {
				to: receipt_email,
				bcc: motopiaEmail,
    	  from: fromEmail,
				templateId: "d-e20f8d06be5a49b582c20855425f1bfb",
    	  dynamic_template_data: {
					...baseEmail,
					total: `${total} ${currency}`,
					downPayment: `${downPayment} ${currency}`,
					monthlyPayment: `${monthlyPayment} ${currency}/Mo`,
					term: `${term} months`,
					name,
					vin,
					stockId
    	  }
    	};
    	sgMail.send(mail);
		}

		if (description === 'Short-Term Rental' || description === 'Rent-to-own') {
			sgMail.setApiKey(config.get("SENDGRID_KEY"));
    	const mail = {
				to: receipt_email,
				bcc: motopiaEmail,
    	  from: fromEmail,
				templateId: "d-3de81ac41d5d486d8bcbdb1b49949c10",
    	  dynamic_template_data: {
					...baseEmail,
					vehicleInfo,
					plateInfo,
					name
    	  }
    	};
    	sgMail.send(mail);
		}

		if (description === 'Retail') {
			sgMail.setApiKey(config.get("SENDGRID_KEY"));
    	const mail = {
				to: receipt_email,
				bcc: motopiaEmail,
    	  from: fromEmail,
				templateId: "d-de049d68b09e48b8970dfab23a331e2d",
    	  dynamic_template_data: {
					...baseEmail,
					name,
					vin,
					stockId
				}
    	};
    	sgMail.send(mail);
		}

		
		console.info('Receipt to customer has been sent');
	} catch (error) {
		return new Error(error.message || error);
	}
}

exports.webhook = async (req, res, next) => {
	let event;

	try {
		event = req.body;
	} catch (err) {
		console.error(err.message || err)
		res.status(400).send(`Webhook Error: ${err.message}`);
	}

	if (event.type === 'payment_intent.succeeded') {
		try {
			await generateReceipt(event.data.object)
		} catch (error) {
			console.error(error);
		}
		console.info('Payment is succeeded');
	}

	res.json({ received: true });
};

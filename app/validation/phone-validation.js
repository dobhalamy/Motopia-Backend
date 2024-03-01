const phoneValidation = (req, res, next) => {
  const { body } = req;
  const { phone } = body;
  const phoneReg = /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/gm;
  if (phone && !phone.match(phoneReg)) {
    res
      .status(400)
      .send(
        "Phone didn't pass the validation. Please fix it and send form again."
      );
  } else next();
};

module.exports = phoneValidation;

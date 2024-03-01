const multer = require('multer');

exports.errorMiddleware = (err, req, res, next) => {
  console.error(err);
  let status = 500;
  let message = 'Something went wrong';
  const result = 'error';
  const exposesErrorInformationToClient = err.status && (err.status < 500 || !!err.expose);
  if (exposesErrorInformationToClient) {
    status = err.status;
    message = err.message || message;
  }

  if (err instanceof multer.MulterError || err.name === "ValidationError") {
    let errors = {};

    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });

    return res.status(400).json({
      result,
      message: err.name,
      errors
    });
  }

  if (res.headersSent) {
    return next(err);
  }
  res.status(status).json({ message, result });
}

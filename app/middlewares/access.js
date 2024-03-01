const { Forbidden } = require("../../../yoga-buddy-be/app/helpers/api_error");

module.exports = role => (req, res, next) => {
  if (req.user.role !== role) {
    return next(new Forbidden(`Only user with role ${role} can do this`));
  }

  next();
};

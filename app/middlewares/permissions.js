const {
  Locked,
  NotAllowed,
  PaymentRequired,
} = require('../helpers/api_error');

const UserModel = require('../models/user');

exports.checkPermission = async (req, res, next) => {
  const user = await UserModel.findOne({ _id: req.user._id });
  if (user) {
    if (user.status === 'blocked') return next(new Locked('Your account is blocked.'));
    if (user.status === 'pending') return next(new NotAllowed('Your phone not specified.'));
    if (user.status === 'unpaid') return next(new PaymentRequired('Your plan or trial period is expired.'));
  }

  next();
};

exports.checkPermissionForUpdate = async (req, res, next) => {
  const user = await UserModel.findOne({ _id: req.user._id });
  if (user) {
    if (user.status === 'blocked') return next(new Locked('Your account is blocked.'));
    if (user.status === 'unpaid') return next(new PaymentRequired('Your plan or trial period is expired.'));
  }

  next();
};

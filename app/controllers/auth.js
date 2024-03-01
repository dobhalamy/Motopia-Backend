const jwt = require("jsonwebtoken");
const passport = require("passport");
const config = require("../../config");
const UserModel = require("../models/cms-users");

exports.getJWToken = user => {
  const body = {
    _id: user._id,
    role: user.role
  };
  return jwt.sign({ user: body }, config.get("JWT_SECRET"), {
    expiresIn: "7d"
  });
};

exports.login = async (req, res, next) => {
  passport.authenticate("login", async (err, user) => {
    if (err) next(err);

    try {
      req.login(user, { session: false }, async error => {
        if (error) next(error);
        if (!user) return;
        const token = this.getJWToken(user);

        res.json({
          token,
          _id: user.id,
          status: user.status,
          role: user.role,
          email: user.email
        });
        // }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

exports.getUser = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const user = await UserModel.findOne({ _id });
    const token = this.getJWToken(user);
    res.json({
      token,
      _id: user.id,
      status: user.status,
      role: user.role,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

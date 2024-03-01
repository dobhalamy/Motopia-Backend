const User = require("../models/cms-users");
const statusArr = ["active", "disactive"];
const roleArr = ["admin", "user"];

const checkHeaders = (headers, res) => {
  if (!String(headers["content-type"]).includes("application/json")) {
    res.status(400);
    res.send("Wrong content-type");
  } else return true;
};

const checkCredentials = (body, res) => {
  const { login, password } = body;
  if (!login || !password) {
    res.status(400).send("There is no Login or Password for Sign up.");
  } else return true;
};

const checkLogin = async login => {
  return await User.exists({ login });
};

const checkBody = async (body, res) => {
  const { email, password, status, role } = body;
  const symbolReg = /([&,?!@#$%^&*()_№;:\-+{}./<>"'|\\])/gm;
  if (status && !statusArr.includes(status)) {
    res.status(400).send("There is not valid status");
  } else if (role && !roleArr.includes(role)) {
    res.status(400).send("There is not valid role");
  } else if (password && password.length < 6) {
    res.status(400).send("Password is to small. 6 symbols needs at list.");
  } else if (login && login.match(symbolReg)) {
    res
      .status(400)
      .send("There is some enabled symbols at Login. Please remove it.");
  } else if (login && (await checkLogin(login))) {
    res.status(400).send("There is already registered User with such Login.");
  } else return true;
};

const userValidator = (req, res, next) => {
  const { method, body, headers } = req;
  checkHeaders(headers, res);

  if (method === "POST") {
    if (checkCredentials(body, res) && checkBody(body, res)) {
      next();
    }
  } else if (method === "PATCH") {
    if (checkBody(body, res)) {
      next();
    }
  } else {
    next();
  }
};

module.exports = userValidator;

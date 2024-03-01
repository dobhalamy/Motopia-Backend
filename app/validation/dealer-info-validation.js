const checkHeaders = (headers, res) => {
  if (!String(headers["content-type"]).includes("multipart/form-data")) {
    res.status(400);
    res.send("Wrong content-type");
  } else return true;
};

const dealerInfoValidator = async (req, res, next) => {
  const { method, headers } = req;
  if (method === "POST") {
    if (checkHeaders(headers, res)) {
      next();
    }
  } else if (method === "PATCH") {
    if (checkHeaders(headers, res)) {
      next();
    }
  } else {
    next();
  }
};

module.exports = dealerInfoValidator;

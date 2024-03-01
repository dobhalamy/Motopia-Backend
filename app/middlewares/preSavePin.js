const { BadRequest } = require("../helpers/api_error");

const preSavePin = (req, res, next) => {
  const { areas, description } = req.body.pin;
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    const desc = description[i];
    const { name } = area;
    const { id } = desc;

    if (name !== id) {
      next(new BadRequest("Name and id fields must be equal!"));
    }

    if (typeof desc.title !== "string") {
      next(new BadRequest("Title must be a string."));
    }

    if (typeof desc.description !== "string") {
      next(new BadRequest("Description must be a string."));
    }
  }
  next();
};

module.exports = preSavePin;

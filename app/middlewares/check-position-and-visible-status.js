const PromoBlock = require("../models/promo-blocks");
const { InternalServerError, Forbidden } = require("../helpers/api_error");

const check = async (req, res, next) => {
  try {
    const { position, visible } = req.body;
    const visiblePromo = await PromoBlock.find({ visible: true });
    if (position < 0 || position > 4) {
      return next(new Forbidden("Position must be in 1-4 range."));
    } else if (visiblePromo.length === 4 && visible === true) {
      return next(
        new Forbidden(`There are already 4 visible Promo blocks. 
      Enable 1 at list at first, or create this withot visible flag`)
      );
    } else {
      next();
    }
  } catch (error) {
    next(new InternalServerError(error));
  }
};

module.exports = check;

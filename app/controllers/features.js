const { BadRequest } = require("../helpers/api_error");
const { getFeatures } = require("../helpers/dms");

exports.updateFeature = async (req, res, next) => {
    const { body } = req;
    const { stockid } = body;
    try {
        await getFeatures(stockid);
        res.json({
            status: "success"
        });
    } catch (error) {
        console.error(error);
        next(new BadRequest(error));
    }
}
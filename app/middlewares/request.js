const { BadRequest } = require('../helpers/api_error');

exports.checkProspect = (req, res, next) => {
    const { body } = req;
    if (!body.prospectId) {
        return next(new BadRequest('You got no your Prospect or Stock ID'));
    } else next();
}
const step = string => {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
};

const flc = (req, res, next) => {
    const body = req.body;
    if (typeof body.firstName !== 'undefined') {
        body.firstName = step(body.firstName);
    }
    if (typeof body.middleName !== 'undefined') {
        body.middleName = step(body.middleName);
    }
    if (typeof body.lastName !== 'undefined') {
        body.lastName = step(body.lastName);
    }
    next();
};

module.exports = flc;

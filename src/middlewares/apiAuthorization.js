const { Unauthorized } = require('../entities/errors');

module.exports = async (req, res, next) => {
    try {
        if (!req.decoded.authorized) throw new Unauthorized("Unauthorized access.");
        next();
    } catch (err) {
        return next(err)
    }
};
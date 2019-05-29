const Logger = require('../logger/log');
const { Unauthorized } = require('../entities/errors');

module.exports = async (err, req, res, next) => {
    try {
        if (err) return next(err);
        if (!req.decoded.authorized) throw new Unauthorized("Unauthorized access.");
        next();
    } catch (err) {
        Logger.error(err);
        return res.redirect('../auth/login', { err });
    }
};
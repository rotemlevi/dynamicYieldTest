const Logger = require('../logger/log');

module.exports = (err, req, res, next) => {
    const msg = ((err) && (err.message));
    const status = ((err) && (err.status)) || 500;
    if (err.cause) Logger.error(err.cause);
    if (res.headersSent) return next(err);
    return res.status(status).json({ err: true, msg });

};
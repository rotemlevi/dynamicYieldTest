const Logger = require('../logger/log');
const jwt = require('../jwt');
const { MissingToken, TokenExpired } = require("../entities/errors");
module.exports = async (req, res, next) => {
    const token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    try {
        if (!token) throw new MissingToken("missing token");
        let decoded = jwt.verify(token);
        if (new Date() > new Date(decoded.exp)) throw new TokenExpired("token expired");
        req.decoded = decoded;
        next();
    } catch (err) {
        Logger.error(err);
        res.cookie('token', '', { expire: Date.now() });
        return res.redirect(302, '../auth/login');
    }
};
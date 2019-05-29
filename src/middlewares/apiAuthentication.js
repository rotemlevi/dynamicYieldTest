const jwt = require('../jwt');
const { TokenExpired, MissingToken } = require('../entities/errors');

module.exports = async (req, res, next) => {
    const token = req.params.token || req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    try {
        if (!token) throw new MissingToken("missing token");
        req.decoded = jwt.verify(token);
        if (new Date() > new Date(req.decoded.exp)) throw new TokenExpired("token expired");
        next();
    } catch (err) {
        res.cookie('token', '', { expire: Date.now()});
        return next(err)
    }
};
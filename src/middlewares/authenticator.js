const Logger = require('../logger/log');
const jwt = require('../jwt');
 
module.exports = async (req, res, next) => {
    const token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    try {
        if (!token) throw "no token provided";
        let decoded = jwt.verify(token);
        if (new Date() > new Date(decoded.exp)) throw "token expired";
        req.decoded = decoded;
        next();
    } catch (err) {
        Logger.error(err);
        return res.redirect('../auth/login');
    }


};
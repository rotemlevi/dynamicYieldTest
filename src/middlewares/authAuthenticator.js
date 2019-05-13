const jwt = require('../jwt');

module.exports = async (req, res, next) => {
    const token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    try {
        let decoded = jwt.verify(token);
        req.decoded = decoded;
        return res.redirect('../app');
    } catch (err) {
        next();
    }
};
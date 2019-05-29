const jwt = require('../jwt');

module.exports = async (req, res, next) => {
    req.decoded = null;
    const token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
    try {
        req.decoded = jwt.verify(token);
        if (req.decoded && req.decoded.authorized) return res.redirect('../app'); //user is authenticated and authorized so he have no reason from being in public section.
        else next();
    }
    catch (err) {
        return next();
    }

};
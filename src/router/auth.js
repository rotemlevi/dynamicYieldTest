const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { publicAccess } = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));

router.use(cookieParser());
router.use(publicAccess);
// App routes
router.get('/login', (req, res) => res.render("login", { module: { user: { authenticated: Object.keys(req.decoded).length > 0, authorized: req.decoded && req.decoded.authorized, mail: req.decoded && req.decoded.mail } } }));
router.get('/login.html', (req, res) => res.render("login", { module: { user: { authorized: req.decoded && req.decoded.authorized, mail: req.decoded && req.decoded.mail } } }));
router.get('/register', (req, res) => res.render("register"));
router.get('/register.html', (req, res) => res.render("register"));
module.exports = router;
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

const login = (req, res) => res.render("login", { module: { user: { authenticated: !!req.decoded, authorized: req.decoded && req.decoded.authorized, mail: req.decoded && req.decoded.mail } } });
const register = (req, res) => res.render("register");

router.get('/login', login);
router.get('/login.html', login);
router.get('/register', register);
router.get('/register.html', register);
module.exports = router;
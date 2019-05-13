const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const {authAuthenticator, exceptionHandler} = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));

router.use(cookieParser());
router.use(authAuthenticator);
router.use(exceptionHandler);

// App routes
router.get('/login', (req, res) => res.redirect('/auth/login.html'));
router.get('/login.html', (req, res) => {
    return res.render("login");
});
router.get('/register', (req, res) => res.redirect('/auth/register.html'));
router.get('/register.html', (req, res) => {
    return res.render("register");
});
module.exports = router;
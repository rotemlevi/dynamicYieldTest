const express = require('express');
const router = express.Router();
const Logger = require('../logger/log');
const cookieParser = require('cookie-parser');
const {
    authenticator,
    exceptionHandler
} = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));
router.use(cookieParser());
router.use(authenticator);
router.use(exceptionHandler);

// App routes
router.get('/', (req, res) => res.redirect('/app/index.html'));
router.get('/index.html', (req, res) => {
    return res.render("index");
});

module.exports = router;
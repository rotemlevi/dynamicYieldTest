const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { appAuthentication, appAuthorization } = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(appAuthentication);
router.use(appAuthorization);

// App routes
router.get('/', (req, res) => res.render("index"));
router.get('/index.html', (req, res) => res.render("index"));

module.exports = router;
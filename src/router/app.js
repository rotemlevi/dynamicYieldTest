const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { appAuthentication, appAuthorization } = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(appAuthentication);
router.use(appAuthorization);

const index = (req, res) => res.render("index");
// App routes
router.get('/', index);
router.get('/index.html', index);

module.exports = router;
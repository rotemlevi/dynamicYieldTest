const express = require('express');
const router = express.Router();
const Logger = require('../logger/log');
const userCollection = require('../entities/user');
const cookieParser = require('cookie-parser');

const {
    apiAuthenticator,
    exceptionHandler
} = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));
router.use(cookieParser());
router.use(apiAuthenticator);
router.use(exceptionHandler);

// App routes
router.get('/users', async (req, res) => {
    let result = await userCollection.getUsersAsync();
    let users = await result.toArray();
    users = users.map(function (user) {
        return user.email;
    });
    return res.status(200).json(users);
});

module.exports = router;
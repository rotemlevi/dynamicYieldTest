const express = require('express');
const router = express.Router();
const userCollection = require('../entities/user');
const cookieParser = require('cookie-parser');
const { apiAuthentication, apiAuthorization } = require('../middlewares');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(apiAuthentication);
router.use(apiAuthorization);

router.get('/users', async (req, res) => {
    let result = await userCollection.getUsersAsync();
    let users = await result.toArray();
    users = users.map(function (user) {
        return user.email;
    });
    return res.status(200).json(users);
});

module.exports = router;
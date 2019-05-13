const express = require('express');
const router = express.Router();
const redisClient = require('../dal/redis');
const crypto = require('crypto');
const exceptionHandler = require('../middlewares/exceptionHandler');
const config = require('../config');
const userCollection = require('../entities/user');
const jwt = require('../jwt');

router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));
router.use(exceptionHandler);

async function login(email, password, validateUser) {
    let expiration = (new Date()).setHours(new Date().getHours() + config.tokenLife);
    const payload = {
        "email": email,
        "password": password
    }
    const refreshToken = jwt.generateRefreshToken();
    const token = jwt.generateToken(payload);
    // do the database authentication here, with user name and password combination.
    if (validateUser) {
        let user = await userCollection.getUserAsync(email);
        let hashPasswordInput = crypto.createHash('md5').update(password).digest("hex");
        if (!(user) || (user.password != hashPasswordInput)) throw "access denied";
    }
    await redisClient.setexAsync(refreshToken, token);
    return {
        token: {
            value: token,
            expiration: expiration
        },
        refreshToken
    };
}

/*router.post('/invalidate', async (req, res) => {
    //TODO 
    add token to black list
});*/

/*router.post('/logout', async (req, res) => {
    
});*/

router.post('/login', async (req, res) => {
    try {
        const body = req.body;
        let response = await login(body.email, body.password, true);
        res.status(200).json(response);
    } catch (err) {
        res.status(401).json({
            msg: "Wrong username or password"
        });
    }
});

router.post('/register', async (req, res) => {
    const body = req.body;
    try {
        await userCollection.insertUserAsync({
            "email": body.email,
            "password": body.password
        });
        let response = await login(body.email, body.password, false);
        res.status(200).json(response);
    } catch (err) {
        if (err.code === 11000) res.status(200).send({
            err: true,
            msg: `${body.email} already exist`
        });
        else res.status(500).send("registration failed");
    }
});

router.post('/token', async (req, res) => {
    try {
        const body = req.body
        const refreshToken = body.refreshToken;
        if (!refreshToken) throw "";
        let token = await redisClient.getAsync(refreshToken);
        let payload = jwt.verify(token);
        payload.expiration = (new Date()).setHours((new Date()).getHours() + config.tokenLife);
        token = jwt.generateToken({
            email: payload.email,
            password: payload.password
        });
        await redisClient.setexAsync(refreshToken, token);
        res.status(200).json({
            token: {
                value: token,
                expiration: payload.expiration
            },
        });
    } catch (err) {
        res.status(404).send('Invalid request')
    }
});
module.exports = router;
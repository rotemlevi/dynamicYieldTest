const express = require('express');
const router = express.Router();
const redisClient = require('../dal/redis');
const crypto = require('crypto');
const { apiAuthentication, apiAuthorization } = require('../middlewares');
const config = require('../config');
const userCollection = require('../entities/user');
const jwt = require('../jwt');
const mailer = require('../services/mailer');
const cookieParser = require('cookie-parser');
const { BaseError, UserAlreadyExistError, MissingRefreshTokenError, InvalidCredentialsError, UknownError } = require('../entities/errors');
const { FailedToActivateUser, FailedToLoginError, FailedToLogoutError, FailedToSendActivationMailError, FailedToRegisterError, FailedToRefreshTokenError, FailedToGenerateToken } = require('../entities/errors');
const { MongoError } = require('mongodb');
const { jsStringEscape } = require('../utils');
router.use(express.json());
router.use(express.urlencoded({
    extended: false
}));
router.use(cookieParser());
//router.use(exceptionHandler);

async function generateTokens(host, email, password, authorized, withRefreshToken, activationToken = false) {
    try {
        const payload = {
            "id": jwt.generateUniqueId(), //so this token can be black list (revoke)
            "email": email,
            "password": password,
            "authorized": authorized,
            "type": activationToken ? "activation" : "authentication"
        }
        const refreshToken = withRefreshToken ? jwt.generateRefreshToken(host) : null;
        const token = activationToken ? jwt.generateActivationToken(payload) : jwt.generateToken(payload);
        if (withRefreshToken) await redisClient.setexAsync(refreshToken, token.value);
        return { refreshToken, token };
    } catch (err) {
        if (err instanceof BaseError) throw err;
        else throw new FailedToGenerateToken("failed to login", 500, err);
    }
}

async function sendActivationMail(host, email, token) {
    try {
        const link = `http://${host}/oAuth/authorized/${token}`;
        const mailOptions = {
            to: email,
            subject: "Please confirm your Email account",
            html: `Hello,<br> Please Click on the link to verify your email.<br><a href="${link}">Click here to verify</a>`
        }
        return mailer.sendMail(mailOptions);
    }
    catch (err) {
        if (err instanceof BaseError) throw err;
        else throw new FailedToSendActivationMailError("failed to send activation mail", 500, err);
    }
}

async function login(host, email, password, validateUser) {
    let user = null;
    let authorized = true;
    if (validateUser) {
        user = await userCollection.getUserAsync(email);
        let hashPasswordInput = crypto.createHash('md5').update(password).digest("hex");
        if (!(user) || (user.password != hashPasswordInput)) throw new InvalidCredentialsError("Wrong username or password", 404, null);
        authorized = user.authorized;
    }
    const { refreshToken, token } = await generateTokens(host, email, password, authorized, authorized, !authorized);
    return {
        token,
        authorized: user ? user.authorized : true,
        refreshToken
    };

}

router.post('/logout', async (req, res, next) => {
    try {
        const body = req.body
        const refreshToken = body.refreshToken;
        await redisClient.removeAsync(refreshToken);
        return res.status(200).json({ msg: "user successfully logged out" });
    } catch (err) {
        if (err instanceof BaseError) return next(err);
        else return next(new FailedToLogoutError("user failed to logged out", 500, err));

    }
});

router.post('/login', async (req, res, next) => {
    try {
        const body = req.body;
        let { authorized, refreshToken, token } = await login(req.get('host'), body.email, body.password, true);
        res.cookie('token', token.value, { expire: token.expiration });
        res.status(200).json({ authorized, refreshToken });
    } catch (err) {
        if (err instanceof BaseError) return next(err);
        else return next(new FailedToLoginError("failed to login", 500, err));
    }
});

router.post('/isAuth', apiAuthentication);

router.post('/resendActivationMail', apiAuthentication, async (req, res, next) => {
    try {
        const host = req.get('host');
        const { token } = await generateTokens(host, req.decoded.email, req.decoded.password, false, false, true);
        await sendActivationMail(host, req.decoded.email, token.value);
        res.status(200).json({ msg: `verfication email was sent to ${req.decoded.email}.` });
    } catch (err) {
        if (err instanceof BaseError) return next(err);
        else return next(new FailedToLoginError("failed to send activation email", 500, err));
    }
});

router.post('/register', async (req, res, next) => {
    const body = req.body;
    try {
        await userCollection.insertUserAsync({
            "email": body.email,
            "password": body.password,
            "authorized": false
        });
        const host = req.get('host');
        const activationToken = await generateTokens(host, body.email, body.password, false, false, true);
        const { token } = await generateTokens(host, body.email, body.password, false, true, false);
        await sendActivationMail(host, body.email, activationToken.token.value);
        res.cookie('token', token.value, { expire: token.expiration });
        res.status(200).json({ err: true, msg: `verfication email was sent to ${body.email}.` });
    } catch (err) {
        if (err instanceof BaseError) return next(err);
        else if ((err instanceof MongoError) && (err.code === 11000)) return next(new UserAlreadyExistError(`${body.email} already exist`, 409, err));
        else next(new FailedToRegisterError("Registration failed", 500, err));
    }
});

router.get('/authorized/:token', apiAuthentication, async (req, res, next) => {
    try {
        await userCollection.updateUserAsync({
            "email": req.decoded.email,
            "password": req.decoded.password,
            "authorized": true
        });
        const { token } = await login(req.get('host'), req.decoded.email, req.destroy.password, false);
        res.cookie('token', token.value, { expire: token.expiration });
        res.render("redirect", { location: `http://${req.get("host")}/app/index.html` }); //safer to redirect from email
    } catch (err) {
        if (err instanceof BaseError) return next(err);
        else return next(new FailedToActivateUser("failed to activate user", 500, err));
    }
});

router.post('/token', async (req, res, next) => {
    try {
        const body = req.body
        const refreshToken = body.refreshToken;
        if (!refreshToken) throw new MissingRefreshTokenError("Refresh token is missing", 404, null);
        let token = await redisClient.getAsync(refreshToken);
        let payload = jwt.verify(token);
        payload.expiration = (new Date()).setHours((new Date()).getHours() + config.tokenLife);
        token = jwt.generateToken({
            email: payload.email,
            password: payload.password,
            authorized: payload.authorized
        });
        await redisClient.setexAsync(refreshToken, token.value);
        res.status(200).json({ token: { value: token, expiration: payload.expiration } });
    } catch (err) {
        if (err instanceof BaseError) return next(err);
        else next(new FailedToRefreshTokenError("Failed to refresh the toke", 500, err));
    }
});

module.exports = router;
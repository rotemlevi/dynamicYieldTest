const jwt = require('jsonwebtoken')
const config = require('../config')
const uuid = require('uuid');


module.exports = {
    ...jwt,
    verify: (token, secret) => {
        return jwt.verify(token, secret || config.secret);
    },
    generateToken: (user, secret, tokenLife) => {
        let expiration = (new Date()).setHours(new Date().getHours() + config.tokenLife);

        return jwt.sign(user, secret || config.secret, {
            expiresIn: tokenLife || expiration
        });
    },
    generateRefreshToken: () => {
        return uuid.v1();
    }
};
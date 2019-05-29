const jwt = require('jsonwebtoken')
const config = require('../config')
const uuidV3 = require('uuid/v3');
const uuidV1 = require('uuid/v1');

module.exports = {
    ...jwt,
    verify: (token, secret) => {
        return jwt.verify(token, secret || config.secret);
    },
    generateToken: (user, secret, tokenLife) => {
        const expiration = (new Date()).setHours(new Date().getHours() + config.tokenLife) || tokenLife;
        return {
            value: jwt.sign(user, secret || config.secret, {
                expiresIn: expiration
            }),
            expiration
        }
    },
    generateActivationToken: (user, secret, tokenLife) => {
        const expiration = (new Date()).setHours(new Date().getHours() + config.activationTokenLife) || tokenLife;
        return {
            value: jwt.sign(user, secret || config.secret, {
                expiresIn: expiration
            }),
            expiration
        }
    },
    generateRefreshToken: (host) => {
        return uuidV3(host, uuidV3.DNS);
    },
    generateUniqueId: () => {
        return uuidV1();
    }

};
class BaseError extends Error {
    constructor(message, status, cause) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.status = status;
        this.cause = cause;
    }
}
class MissingToken extends BaseError {

}

class TokenExpired extends BaseError {

}

class MissingRefreshTokenError extends BaseError {
}
class InvalidCredentialsError extends BaseError {

}
class InvalidRequestError extends BaseError {

}
class AccessDeniedError extends BaseError {

}

class UknownError extends BaseError {



}

class Unauthorized extends BaseError {
}

class UserAlreadyExistError extends BaseError {

}

class FailedToLoginError extends UknownError {

}
class FailedToLogoutError extends UknownError {

}

class FailedToSendActivationMailError extends UknownError {

}

class FailedToRegisterError extends UknownError {

}

class FailedToRefreshTokenError extends UknownError {

}
class FailedToActivateUser extends UknownError {

}
class FailedToGenerateToken extends UknownError {

}

module.exports = {
    BaseError,
    MissingToken,
    TokenExpired,
    Unauthorized,
    MissingRefreshTokenError,
    InvalidCredentialsError,
    InvalidRequestError,
    AccessDeniedError,
    UknownError,
    UserAlreadyExistError,
    FailedToLoginError,
    FailedToLogoutError,
    FailedToSendActivationMailError,
    FailedToRegisterError,
    FailedToRefreshTokenError,
    FailedToActivateUser,
    FailedToGenerateToken
}
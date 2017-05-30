const jwt = require("jsonwebtoken");
const Config = require("config");

/**
 * account should be a valid account see data-models/account to see how a account model should look like
 * @param  {object} user
 * @return {string || error}
 */
module.exports = account => {

    if (!account) {
        return {errorType: "invalidFunctionInput"};
    }

    const token = jwt.sign(account, Config.security.secret, {
        expiresIn: Config.security.tokenLife,
        algorithm: Config.security.hash
    });

    return token;
};

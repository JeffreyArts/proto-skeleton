/* global  */

const jwt = require("jsonwebtoken");
const Config = require("config");

const tokenTypeMap = {
    refresh: "refreshTokenLife",
    access: "accessTokenLife",
    passwordReset: "passwordResetTokenLife"
}
/**
 * account should be a valid account see data-models/account to see how a account model should look like
 * @param  {object} user
 * @return {string || error}
 */
module.exports = (account, tokenType) => {

    if (!account) {
        return "invalidFunctionInput";
    }

    if (tokenTypeMap[tokenType] === undefined) {
        return "unknownTokenType";
    }

    account.tokenType = tokenType;

    const token = jwt.sign(account, Config.security.secret, {
        expiresIn: Config.security[tokenTypeMap[tokenType]],
        algorithm: Config.security.hash
    });

    return token;
};

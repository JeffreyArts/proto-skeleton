/* global requireShared */

const signToken   = requireShared("utilities/signToken");
const Account     = requireShared("models/account");

module.exports = function(req, res, next) {
    const tokenMap = {
        refreshToken: () => {
            return Account.getAccessTokenByRefresh(req.body.refreshToken)
        },
        passwordResetToken: () => {
            return Account.getAccessTokenByPasswordReset(req.body.passwordResetToken)
        }
    };

    // Define token
    let token = null;

    if (req.body.refreshToken) {
        token = "refreshToken";
    } else if (req.body.passwordResetToken) {
        token = "passwordResetToken";
    }

    // Process token
    if (token) {
        return tokenMap[token]()
        .then(tmp => {
            Account.getById(tmp._id)
            .then(account => {
                req.resStatus = 200;
                req.resContent = {
                    accessToken: signToken(account, "access")
                };
                return next();
            })
            .catch(err => {
                req.resStatus = 400;
                req.error = err;
                return next();
            })
        })
        .catch(err => {
            req.resStatus = 400;
            req.error = new Error("invalidToken");
            req.error.details = token;
            return next();
        })
    }

    // Unknown token
    req.resStatus = 400;
    req.error = new Error("unknownToken");
    req.error.details = token;
    return next();
};

/* global requireShared */

const signToken   = requireShared("utilities/signToken");
const Account           = requireShared("models/account");

module.exports = function(req, res) {
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
                return res.status(200)
                .json({
                    accessToken: signToken(account, "access")
                })
            })
            .catch(err => {
                return res.status(400)
                .json({
                    errorType: err
                })
            })
        })
        .catch(err => {
            return res.status(400)
            .json({
                errorType: err
            })
        })
    }

    // Unknown token
    return res.status(400)
    .json({
        errorType: "unknownToken"
    })

};

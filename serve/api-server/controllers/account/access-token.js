/* global requireShared, requireApi */

const signAccessToken   = requireShared("utilities/signAccessToken");
const Account           = requireShared("models/account");


module.exports = function(req, res) {

    if (req.body.refreshToken) {
        return Account.getAccessTokenByRefresh(req.body.refreshToken)
        .then(tmp => {
            Account.getById(tmp._id)
            .then(account => {
                return res.status(200)
                .json({
                    accessToken: signAccessToken(account)
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

    return res.status(400)
    .json({
        errorType: "unknownToken"
    })

};

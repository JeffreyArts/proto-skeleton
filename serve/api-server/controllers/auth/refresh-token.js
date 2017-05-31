/* global requireShared */

const signRefreshToken = requireShared("utilities/signRefreshToken");
const signAccessToken = requireShared("utilities/signAccessToken");
const {pick} = require("lodash");


module.exports = (req, res) => {

    const user = pick(req.user, ["_id", "name", "email"]);
    const userId = pick(req.user, ["_id"]);

    if (req.session.redirectUrl) {
        const url = `${req.session.redirectUrl}?refreshToken=${signRefreshToken(user)}`;
        res.redirect(url);
    } else {
        res.status(202).send({
            refreshToken: signRefreshToken(userId),
            accessToken: signAccessToken(user)
        });
    }

    delete req.session.redirectUrl;
    return;
}
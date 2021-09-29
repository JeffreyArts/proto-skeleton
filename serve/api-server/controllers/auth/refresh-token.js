/* global requireShared */

const signToken = requireShared("utilities/signToken");
const {pick} = require("lodash");


module.exports = (req, res, next) => {

    if (req.error) {
        return next();
    }

    const accessToken = signToken(pick(req.user, ["_id", "name", "email"]), "access");
    const refreshToken = signToken(pick(req.user, ["_id"]), "refresh");


    if (req.session.redirectUrl) {
        const url = `${req.session.redirectUrl}?refreshToken=${refreshToken}&accessToken=${accessToken}`;
        res.redirect(url);
    } else {
        req.resStatus = 202;
        req.resContent = {
            refreshToken: refreshToken,
            accessToken: accessToken
        };
        return next();
    }

    delete req.session.redirectUrl;
    return;
}
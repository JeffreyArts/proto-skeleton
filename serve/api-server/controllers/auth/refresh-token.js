/* global requireShared */

const signToken = requireShared("utilities/signToken");
const {pick} = require("lodash");


module.exports = (req, res) => {

    const accessToken = signToken(pick(req.user, ["_id", "name", "email"]), "access");
    const refreshToken = signToken(pick(req.user, ["_id"]), "refresh");


    if (req.session.redirectUrl) {
        const url = `${req.session.redirectUrl}?refreshToken=${refreshToken}&accessToken=${accessToken}`;
        res.redirect(url);
    } else {
        res.status(202).send({
            refreshToken: refreshToken,
            accessToken: accessToken
        });
    }

    delete req.session.redirectUrl;
    return;
}
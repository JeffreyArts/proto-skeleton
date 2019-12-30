/* global requireShared */
"use strict";
const _             = require( "lodash");
const ObjectId      = require("promised-mongo").ObjectId;


module.exports = (req, res, next) => {

    if (_.isUndefined(req.query.extend) ) {
        return next();
    }
    if (_.isUndefined(req.resContent) ) {

        req.error = {message: "resContentUndefined"};
        return next();
    }

    req.query.extend = req.query.extend.split(",");

    const waitlist = [];


    return Promise.all(waitlist)
        .then(() => {
            return next();
        })
        .catch(err => {
            req.error = err;
            return next();
        })
}

"use strict";

module.exports = function(req, res, next) {
    if (req.error) {
        return next()
    }

    if (!req.user) {
        req.resStatus = 422;
        req.error = new Error("noTokenProcessed");
        return next();
    }

    // decode token
    if (req.user._id == req.params.accountId) {
        return next();
    } else {
        // if someone else tries to get your messages
        // return an error
        req.resStatus = 400;
        req.error = new Error("unauthorizedAction");
        return next();
    }
}

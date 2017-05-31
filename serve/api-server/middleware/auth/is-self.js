"use strict";

module.exports = function(req, res, next) {
    if (!req.user) {
        console.error("First decode JWT token with JWT strategy");
        return res.status(500).send({
            errorType: "noTokenProcessed"
        });
    }

    // decode token
    if (req.user._id == req.params.accountId) {
        next();
        return true;
    } else {
        // if someone else tries to get your messages
        // return an error
        res.status(400).send({
            errorType: "unauthorizedAction"
        });
        return false;
    }
}

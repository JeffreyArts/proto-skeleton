/* global requireDatamodel,requireShared */
const _ = require("lodash");
const errorHandler = requireShared("utilities/error-handler");

module.exports = function(req, res) {
    req.resStatus = req.resStatus || 200;
    if (req.error) {
        console.log('Hmmmmm');
        req.resStatus = req.resStatus || 404;
        errorHandler.processError(req);
    }

    if (_.isObject(req.resContent)) {
        return res.status(req.resStatus)
        .json(req.resContent);
    }

    return res.status(req.resStatus)
    .send(req.resContent);
};

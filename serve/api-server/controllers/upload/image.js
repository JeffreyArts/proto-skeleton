/* global requireShared, requireApi */

const _      = require("lodash");
const Upload = requireShared("models/upload");


// Validators
const isImage       = requireApi("validators/upload/is-image");


module.exports = function(req, res, next) {
    if (req.error) {
        return next();
    }

    const file = req.file;

    if (!file) {
        req.error = new Error("noFile");
        req.resStatus = 400;
        return next();
    }

    Promise.all([
        isImage(file["mimetype"]),
    ])
    .then(() => {
        file.accountId = req.user._id;
        Upload.save(file)
            .then(o => {
                req.resContent = _.pick(o, ["_id"]);
                req.resStatus = 201;
                return next();
            })
            .catch(err => {
                req.error = new Error("databaseError");
                req.error.details = err;
                req.resStatus = 500;
                return next();
            });
    })
    .catch(err => {
        req.error = err;
        req.resStatus = 406;
        return next();
    });
};
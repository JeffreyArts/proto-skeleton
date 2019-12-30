/* global requireShared, requireApi */

const _      = require("lodash");
const Upload = requireShared("models/upload");


// Validators
const isImage       = requireApi("validators/upload/is-image");


module.exports = function(req, res) {
    const file = req.file;
    
    if (!file) {
        return res.status(500)
            .json({
                errorType: "noFile"
            });
    }

    Promise.all([
        isImage(file["mimetype"]),
    ])
        .then(() => {
            file.accountId = req.user._id;
            Upload.save(file)
                .then(o => {
                    const result = _.pick(o, ["_id"])
                    res.status(201);
                    res.json(result);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500);
                    res.json({
                        errorCode: "databaseError"
                    });
                });
        })
        .catch(err => {
            res.status(406);
            res.json(err);
        });
};
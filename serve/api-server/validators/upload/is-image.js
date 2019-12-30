const _                 = require("lodash");
const allowedMimeTypes  = ["image/jpeg", "image/jpg", "image/png"];

module.exports = string => new Promise((resolve, reject) => {
    if (!_.isString(string)) {
        return reject({errorType: "notStringType"});
    }

    if (allowedMimeTypes.indexOf(string) === -1) {
        return reject({errorType: "incorrectFileType"});
    }

    return resolve(true);

});

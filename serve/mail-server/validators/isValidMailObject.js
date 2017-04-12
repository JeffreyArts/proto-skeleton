const {each} = require("lodash");
const emailModel = requireDatamodel("email");

module.exports = object => {
    let containAllRequiredFields = true;

    each(emailModel, (v,k) => {
        if (object[k] === undefined ) {
            containAllRequiredFields = false;
        }
    })

    return containAllRequiredFields;
}
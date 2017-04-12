/* global requireShared, requireDatamodel, requireMail */

const db                = requireShared("utilities/db");
const collection        = db.get("mailingQueu");
const moment            = require("moment");
const {merge}           = require("lodash");
const emailModel        = requireDatamodel("email");
const isValidMailObject = requireMail("validators/isValidMailObject");


module.exports = mailObject => {
    return new Promise((resolve, reject) => {
        if (isValidMailObject(mailObject)) {
            // add mail to db
            const newMail = merge({}, emailModel, mailObject);
            newMail.created = moment.utc().unix();

            return collection.insert(newMail)
            .then(result => resolve(result))
            .catch(error => reject(error));
        }
        return reject(mailObject);
    })
};
/* global requireShared */

const Account       = requireShared("models/account");
const pass          = requireShared("utilities/password");
const {each, size}  = require("lodash");

// Validators
const allowedKeys = ["password", "name", "email"]


module.exports = function(req, res, next) {

    if (req.error) {
        return next();
    }

    const accountId = req.params.accountId;
    const properties = req.body;
    Account.getById(accountId)
    .then(() => {
        const allowedKeyErrors = [];
        each(properties,(value, key) => {
            if (allowedKeys.indexOf(key) === -1 ) {
                allowedKeyErrors.push(key);
            }
        })

        if (allowedKeyErrors.length > 0) {
            req.error = new Error("invalidKeys");
            req.error.details = {
                invalidKeys: allowedKeyErrors,
                allowedKeys: allowedKeys
            }
            req.resStatus = 400;
            return next();
        }

        if (size(properties) == 0) {
            req.error = new Error("emptyJSON");
            req.resStatus = 400;
            return next();
        }

        if (properties.email && properties.email.indexOf("@") === -1) {
            req.error = new Error("invalidEmail");
            req.resStatus = 400;
            return next();
        }

        if (properties.password) {
            properties.salt = pass.getSalt();
            properties.hashedPassword = pass.getHashedPass(properties.password, properties.salt);

            // IMPORTANT: Remove unhashed password
            delete properties.password;
        }



        return Account.update(accountId, properties)
        .then(updatedAccount => {
            req.resContent = updatedAccount
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
        req.resStatus = 403;
        return next();
    })
};

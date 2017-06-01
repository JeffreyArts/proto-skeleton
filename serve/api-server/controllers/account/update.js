/* global requireShared */

const Account       = requireShared("models/account");
const pass          = requireShared("utilities/password");
const {each, size}  = require("lodash");

// Validators
const allowedKeys = ["password", "name", "email"]


module.exports = function(req, res) {

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
            return res.status(400)
            .json({
                errorType: "invalidKeys",
                invalidKeys: allowedKeyErrors
            });
        }

        if (size(properties) == 0) {
            return res.status(400)
            .json({
                errorType: "emptyJSON"
            });
        }
        
        if (properties.password) {
            properties.salt = pass.getSalt();
            properties.hashedPassword = pass.getHashedPass(properties.password, properties.salt);

            // IMPORTANT: Remove unhashed password
            delete properties.password;
        }


        return Account.update(accountId, properties)
        .then(updatedAccount => {
            return res.status(201)
            .json(updatedAccount);
        })
        .catch(err => {
            console.error(err);
            return res.status(500)
            .json({errorCode: "databaseError"});
        });
    })
    .catch(err => {
        res.status(403)
        res.json({
            errorType: err
        });
    })


};

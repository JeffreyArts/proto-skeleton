/* global requireShared */

const Account = requireShared("models/account");

module.exports = account => new Promise((resolve, reject) => {
    Account.getByEmail(account.email, account.password)
    .then(() => resolve(true))
    .catch(error => {
        if (error === "incorrectPassword" || error === "accountNotFound") {
            return reject({errorType: "incorrectCredentials"});
        }
        
        console.error(error);
        return reject({errorType: "internalServerError"});

    });
});

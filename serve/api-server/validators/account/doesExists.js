/* global requireShared */

const db = requireShared("utilities/db"),
    collection = db.get("accounts");

module.exports = account => new Promise((resolve, reject) => {
    collection.findOne({email: account.email})
    .then(result => {
        if (result === null) {
            return reject({errorType: "doesNotExists", properties: {property: "account", value: account.email}});
        }
        return resolve(true);

    })
    .catch(err => {
        console.error(err);
        reject({errorType: "internalServerError"})
    });
});



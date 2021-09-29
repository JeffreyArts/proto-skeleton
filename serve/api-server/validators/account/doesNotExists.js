/* global requireShared */

const db = requireShared("utilities/db");
const collection = db.get("accounts");

module.exports = account => new Promise((resolve, reject) => {
    collection.findOne({email: account.email})
    .then(result => {
        if (result !== null) {
            const err = new Error("alreadyExists");
            err.details = {
                properties: {
                    property: "account",
                    value: account.email
                }
            }
            return reject(err);
        }
        return resolve(true);

    })
    .catch(() => reject(new Error("internalServerError")));
});



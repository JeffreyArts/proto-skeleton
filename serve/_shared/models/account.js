/* global requireShared requireDatamodel */

const _ = require("lodash"),
    moment = require("moment"),
    pass = requireShared("utilities/password"),
    db = requireShared("utilities/db"),
    accountModel = requireDatamodel("account"),
    ObjectId = require("promised-mongo").ObjectId,
    collection = db.get("accounts"),
    jwt = require("jsonwebtoken"),
    Config = require("config");

const Account = {
    create: function(account) {

        const newAccount = _.merge({}, accountModel, account);

        return new Promise((resolve, reject) => {
            collection.findOne({email: account.email})
            .then(result => {
              if (result === null) {
                  newAccount.salt = pass.getSalt();

                  if (typeof newAccount.password === "string") {
                      newAccount.hashedPassword = pass.getHashedPass(newAccount.password, newAccount.salt);
                      // IMPORTANT: Remove unhashed password
                      delete newAccount.password;
                  }

                  newAccount.created = moment.utc().unix();
              // Insert newAccount in database
                  return collection.insert(newAccount).then(result => resolve(result));
              }
              return reject(new Error("accountAlreadyExists"));
            })

            .catch(error => {
                var err = new Error("internalServerError")
                err.details = error;
                reject(err);
            });
        });

    },
    update: (accountId, properties) => new Promise((resolve, reject) => {
        Account.getById(accountId)
        .then(account => {
            const updatedAccount = _.merge({}, account, properties);

            collection.update(
                { _id: ObjectId(accountId)},
                {$set: properties}
            )
            .then(() => {
                delete updatedAccount.salt;
                delete updatedAccount.hashedPassword;
                delete updatedAccount.passwordResetToken;

                return resolve(updatedAccount)
            })
            .catch(error => {
                var err = new Error("internalServerError")
                err.details = error;
                reject(err);
            });
        })
        .catch(error => {
            var err = new Error("internalServerError")
            err.details = error;
            reject(err);
        });

    }),
    delete: accountId => new Promise((resolve, reject) => {
        Account.getById(accountId)
        .then(account => {
            collection.remove(ObjectId(accountId))
            .then(() => {
                return resolve(account);
            })
            .catch(error => {
                var err = new Error("internalServerError")
                err.details = error;
                reject(err);
            });
        })
        .catch(error => {
            var err = new Error("internalServerError")
            err.details = error;
            reject(err);
        });
    }),

    // Create account
    createViaFacebook: function(account) {

        if (!account.facebookId) {
            return console.error("missing required parameter facebookId");
        }
        const newAccount = _.merge({}, accountModel, account);


        return new Promise((resolve, reject) => {
            collection.findOne({facebookId: account.facebookId})
            .then(result => {
                if (result === null) {
                    // Add salt, for if user would like to add a direct password to it's account in the future
                    newAccount.salt = pass.getSalt();

                    // Insert newAccount in database
                    return collection.insert(newAccount).then(result => resolve(result));
                }
                return reject(new Error("accountAlreadyExists"));
            })
            .catch(error => {
                var err = new Error("internalServerError")
                err.details = error;
                reject(err);
            });
        });

    },
    createViaGoogle: function(account) {

        if (!account.googleId) {
            return console.error("missing required parameter googleId");
        }
        const newAccount = _.merge({}, accountModel, account);

        return new Promise((resolve, reject) => {
            collection.findOne({googleId: account.googleId})
            .then(result => {
                if (result === null) {
                    // Add salt, for if user would like to add a direct password to it's account in the future
                    newAccount.salt = pass.getSalt();

                    // Insert newAccount in database
                    return collection.insert(newAccount).then(result => resolve(result));
                }
                return reject(new Error("accountAlreadyExists"));
            })
            .catch(error => {
                var err = new Error("internalServerError")
                err.details = error;
                reject(err);
            });
        });

    },



    // Get account
    getByEmail: (email, password) => new Promise((resolve, reject) => {
        collection.findOne({email: email})
        .then(account => {
            if (!account) {
                var err = new Error("accountNotFound");
                err.details = {email:email};
                return reject(err);
            }

            if (password) {
                if (account.hashedPassword !== pass.getHashedPass(password, account.salt)) {
                    return reject(new Error("incorrectPassword"));
                }
            }

            delete account.salt;
            delete account.hashedPassword;

            return resolve(account);
        })
        .catch(error => {
            var err = new Error("internalServerError")
            err.details = error;
            reject(err);
        })
    }),
    getById: accountId => new Promise((resolve, reject) => {
        if (accountId.length === 12 || accountId.length === 24  ) {
            collection.findOne({_id: ObjectId(accountId)})
            .then(account => {
                if (!account) {
                    var err = new Error("accountNotFound");
                    err.details = {_id: accountId};
                    return reject(err);
                }

                delete account.salt;
                delete account.hashedPassword;

                return resolve(account);
            })
            .catch(error => {
                var err = new Error("internalServerError")
                err.details = error;
                reject(err);
            });
        } else {
            var error = new Error("invalidId");
            error.details = {accountId: accountId}
            return reject(error);
        }
    }),
    getByFacebookId: facebookId => new Promise((resolve, reject) => {
        collection.findOne({facebookId: facebookId})
        .then(account => {
            if (!account) {
                var err = new Error("accountNotFound");
                err.details = {facebookId: facebookId};
                return reject(err);
            }

            return resolve(account);
        })
        .catch(error => {
            var err = new Error("internalServerError")
            err.details = error;
            reject(err);
        });
    }),
    getByGoogleId: googleId => new Promise((resolve, reject) => {
        collection.findOne({googleId: googleId})
        .then(account => {
            if (!account) {
                var err = new Error("accountNotFound");
                err.details = {googleId: googleId};
                return reject(err);
            }

            return resolve(account);
        })
        .catch(error => {
            var err = new Error("internalServerError")
            err.details = error;
            reject(err);
        });
    }),

    // Get token
    getAccessTokenByRefresh: refreshToken => new Promise((resolve, reject) => {
        jwt.verify(refreshToken, Config.security.secret, {
            algorithms: [Config.security.hash]
        }, (err, decoded) => {
            if (err) {
                return reject(new Error("corruptedToken"))
            } else {
                if (decoded.tokenType === "refresh") {
                    return resolve(decoded);
                }
                return reject(new Error("invalidToken"))
            }
        });
    }),
    getAccessTokenByPasswordReset: passwordResetToken => new Promise((resolve, reject) => {
        jwt.verify(passwordResetToken, Config.security.secret, {
            algorithms: [Config.security.hash]
        }, (err, decoded) => {
            if (err) {
                return reject(new Error("corruptedToken"))
            } else {
                if (decoded.tokenType === "passwordReset") {
                    return resolve(decoded);
                }
                return reject(new Error("invalidToken"))
            }
        });
    })
};

module.exports = Account;
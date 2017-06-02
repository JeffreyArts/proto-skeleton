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
        if (typeof newAccount.password !== "string") {
            return new Promise((resolve, reject) => {
                reject("incorrectPasswordProperty");
            });
        }

        return new Promise((resolve, reject) => {
            collection.findOne({email: account.email})
      .then(result => {
          if (result === null) {
              newAccount.salt = pass.getSalt();
              newAccount.hashedPassword = pass.getHashedPass(newAccount.password, newAccount.salt);

          // IMPORTANT: Remove unhashed password
              delete newAccount.password;
              newAccount.created = moment.utc().unix();

          // Insert newAccount in database
              return collection.insert(newAccount).then(result => resolve(result));
          }
          return reject("accountAlreadyExists");
      })
      .catch(error => reject(error));

        });

    },
    update: (accountId, properties) => new Promise((resolve, reject) => {
        Account.getById(accountId)
        .then(account => {
            const updatedAccount = _.merge({}, account, properties);
            collection.update({_id: ObjectId(accountId)}, updatedAccount)
            .then(() => {
                delete updatedAccount.salt;
                delete updatedAccount.hashedPassword;
                delete updatedAccount.passwordResetToken;
                return resolve(updatedAccount)
            })
            .catch(err => {
                return reject(err);
            })

        })
        .catch(reject);
    }),
    delete: accountId => new Promise((resolve, reject) => {
        Account.getById(accountId)
        .then(account => {
            collection.remove(ObjectId(accountId))
            .then(() => {
                return resolve(account);
            })
            .catch(reject);
        })
        .catch(reject);
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
                    // Insert newAccount in database
                    return collection.insert(newAccount).then(result => resolve(result));
                }
                return reject("accountAlreadyExists");
            })
            .catch(reject);
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
                    // Insert newAccount in database
                    return collection.insert(newAccount).then(result => resolve(result));
                }
                return reject("accountAlreadyExists");
            })
            .catch(reject);
        });

    },



    // Get account
    getByEmail: (email, password) => new Promise((resolve, reject) => {
        collection.findOne({email: email})
        .then(account => {
            if (!account) {
                return reject("accountNotFound");
            }

            if (password) {
                if (account.hashedPassword !== pass.getHashedPass(password, account.salt)) {
                    return reject("incorrectPassword");
                }
            }

            delete account.salt;
            delete account.hashedPassword;

            return resolve(account);
        })
        .catch(err => {
            console.log(err);
            reject("internalServerError");
        })
    }),
    getById: accountId => new Promise((resolve, reject) => {
        if (accountId.length === 12 || accountId.length === 24  ) {
            collection.findOne({_id: ObjectId(accountId)})
            .then(account => {
                if (!account) {
                    return reject("accountNotFound");
                }

                delete account.salt;
                delete account.hashedPassword;

                return resolve(account);
            })
            .catch(err => {
                console.error(err);
                reject("internalServerError");
            });
        } else {
            return reject("invalidId");
        }
    }),
    getByFacebookId: facebookId => new Promise((resolve, reject) => {
        collection.findOne({facebookId: facebookId})
        .then(account => {
            if (!account) {
                // Create account when none is found
                return reject("accountNotFound");
            }

            return resolve(account);
        })
        .catch(err => {
            console.error(err);
            reject("internalServerError");
        });
    }),
    getByGoogleId: googleId => new Promise((resolve, reject) => {
        collection.findOne({googleId: googleId})
        .then(account => {
            if (!account) {
                // Create account when none is found
                return reject("accountNotFound");
            }

            return resolve(account);
        })
        .catch(err => {
            console.error(err);
            reject("internalServerError");
        });
    }),

    // Get token
    getAccessTokenByRefresh: refreshToken => new Promise((resolve, reject) => {
        jwt.verify(refreshToken, Config.security.secret, {
            algorithms: [Config.security.hash]
        }, (err, decoded) => {
            if (err) {
                return reject("corruptedToken")
            } else {
                if (decoded.tokenType === "refresh") {
                    return resolve(decoded);
                }
                return reject("invalidToken")
            }
        });
    }),
    getAccessTokenByPasswordReset: passwordResetToken => new Promise((resolve, reject) => {
        jwt.verify(passwordResetToken, Config.security.secret, {
            algorithms: [Config.security.hash]
        }, (err, decoded) => {
            if (err) {
                return reject("corruptedToken")
            } else {
                if (decoded.tokenType === "passwordReset") {
                    return resolve(decoded);
                }
                return reject("invalidToken")
            }
        });
    })
};

module.exports = Account;
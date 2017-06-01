/* global requireShared, requireApi */

const localStrategy = require("passport-local").Strategy;
const passport = require("passport");
const Account = requireShared("models/account");

const hasPassword = requireApi("validators/object/hasPassword");
const hasEmail = requireApi("validators/object/hasEmail");
const authByEmail = requireApi("validators/account/authByEmail");

const options = {
    usernameField: "email",
    session: false
};




module.exports = {
    strategy: new localStrategy( options, (email, password, done) => {
        Account.getByEmail(email, password)
        .then(account => {
            return done(null, account);
        })
        .catch(err => {
            return done({errorType: err});
        });
    }),


    authorize: (req, res, next) => {
        const credentials = req.body;

        Promise.all([
            hasPassword(credentials),
            hasEmail(credentials)
        ]).then(() => {

            passport.authenticate("local", (err, account) => {

                if (typeof req.user === "undefined") {
                    req.user = account;
                }

                if (account) {
                    return next();
                }

                return res.status(406).send(err);
            })(req, res, next);
        })
        .catch(err => {
            res.status(406);
            res.json(err);
        });
    }
}

/* global requireShared, requireApi */

const localStrategy = require("passport-local").Strategy;
const passport = require("passport");
const Account = requireShared("models/account");
const validEmail        = requireShared("utilities/validate-email");

const hasPassword = requireApi("validators/object/hasPassword");
const hasEmail = requireApi("validators/object/hasEmail");
const authByEmail = requireApi("validators/account/authByEmail");

const options = {
    usernameField: "email",
    session: false
};




module.exports = {
    strategy: new localStrategy( options, (email, password, next) => {
        Account.getByEmail(email, password)
        .then(account => {
            return next(null, account);
        })
        .catch(err => {
            return next(err);
        });
    }),


    authorize: (req, res, next) => {
        const credentials = req.body;

        if (!validEmail(req.body.email)) {
            req.error = new Error("invalidEmailaddress")
            req.resStatus = 400;
            req.error.details = {
                input: req.body.email
            }
            return next();
        }

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
                req.error = err;
                req.resStatus = 406;
                return next();
            })(req, res, next);
        })
        .catch(err => {
            req.error = err;
            req.resStatus = 406;
            return next();
        });
    }
}

/* global requireShared, requireShared, requireDatamodel, requireLocale*/

const {merge}           = require("lodash");
const Config            = require("config");
const ejs               = require("ejs");
const emailDataModel    = requireDatamodel("email");

const Account           = requireShared("models/account");
const Mail              = requireShared("models/mail");
const signToken         = requireShared("utilities/signToken");


module.exports = function(req, res, next) {
    const accountEmail      = req.body.email;
    const templateValues    = requireLocale("en/mail/forgot-password");
    Account.getByEmail(accountEmail)
    .then(account => {
        const token = signToken({_id: account._id}, "passwordReset");
        const emailObject = merge({}, emailDataModel);
        const ejsData = {
            url: `${Config["mail-server"].appUrl}?passwordResetToken=${token}`
        }

        emailObject.to = accountEmail;
        emailObject.subject = templateValues.subject;
        emailObject.text = templateValues.text;

        return Mail.getTemplate("default", templateValues)
        .then(html => {
            const options = {
                cache: false
            };
            emailObject.html = ejs.render(html, ejsData, options);

            // Send mail
            Mail.add(emailObject);

            req.resStatus = 200;
            req.resContent = {
                successType: "mailSent"
            };
            return next()
        })
        .catch(err => {
            const error = new Error('internalServerError');
            error.details = err;
            req.error = error
            req.resStatus = 500;
            return next();
        });
    })
    .catch(err => {
        req.resStatus = 500;
        const error = new Error('internalServerError');
        error.details = err;
        req.error = error;
        return next();
    });
};
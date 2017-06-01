/* global requireShared, requireShared, requireDatamodel, requireLocale*/

const {merge}           = require("lodash");
const Config            = require("config");
const ejs               = require("ejs");
const emailDataModel    = requireDatamodel("email");

const Account           = requireShared("models/account");
const Mail              = requireShared("models/mail");
const signToken         = requireShared("utilities/signToken");


module.exports = function(req, res) {
    const accountEmail      = req.body.email;
    const templateValues    = requireLocale("en/mail/forgot-password");
    Account.getByEmail(accountEmail)
    .then(account => {
        if (account.email) {
            const token = signToken({_id: account._id}, "passwordReset");
            const emailObject = merge({}, emailDataModel);
            const ejsData = {
                url: `${Config["mail-server"].appUrl}?passwordResetToken=${token}`
            }

            emailObject.to = account.email;
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

                return res.status(200)
                .json({
                    successType: "mailSent"
                });
            })
            .catch(err => {
                console.error(err);

                return res.status(500)
                .json({
                    errorType: "internalServerError"
                })
            });
        }


        return res.status(409)
        .json({
            errorType: "hasNoEmail"
        });
    })
    .catch(err => {
        return res.status(500)
        .json({
            errorType: err
        })
    });
};
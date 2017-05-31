/* global requireShared, requireShared, requireDatamodel, requireLocale*/

const {merge}           = require("lodash");
const Config            = require("config");
const ejs               = require("ejs");
const emailDataModel    = requireDatamodel("email");

const Account           = requireShared("models/account");
const Mail              = requireShared("models/mail");


module.exports = function(req, res) {
    const accountId         = req.params.accountId;
    const templateValues    = requireLocale("en/mail/forgot-password");

    Account.getById(accountId)
    .then(account => {
        if (account.email) {
            const emailObject = merge({}, emailDataModel);
            const ejsData = {
                url: Config["mail-server"].appUrl
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

                Mail.add(emailObject);
                return res.status(200)
                .send(emailObject);
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
/* global requireShared, requireLocale*/

const Config         = require("config");
const ejs            = require("ejs");
const Mail           = requireShared("models/mail");
const templateValues = requireLocale("en/mail/forgot-password");

module.exports = function(req, res) {
    const ejsData = {
        url: Config["mail-server"].appUrl
    }

    Mail.getTemplate("default", templateValues)
    .then(html => {

        const options = {
            cache: false
        };

        res.status(200).send(ejs.render(html, ejsData, options))
    })
    .catch(err => {
        console.log(err);
        res.status(400).json(err)
    })
};
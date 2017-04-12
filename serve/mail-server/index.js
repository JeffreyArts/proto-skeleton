/* global requireShared */
"use strict";

const Config    = require("config");
const Mail      = requireShared("models/mail");

const mailOptions = {
    from: '"Test account" <prototypeskeleton@gmail.com>', // sender address
    to: "sjeffff@gmail.com", // list of receivers (comma seperated)
    subject: "Test 123", // Subject line
    text: "Text", // plaintext body
    html: "<b>HTML</b>" // html body
};

const interval = Config["mail-server"].interval || 10000;
const processQueu = () => {
    Mail.sendFromQueu().then(res => {
        processQueu();
    })
    .catch(() => {
        setTimeout(processQueu, interval)
    })
}


Mail.add(mailOptions)
Mail.add(mailOptions)
Mail.add(mailOptions)
Mail.add(mailOptions)
Mail.add(mailOptions)

processQueu();
module.exports = Mail;
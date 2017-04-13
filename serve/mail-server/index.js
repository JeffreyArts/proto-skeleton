/* global requireShared */
"use strict";

const Config    = require("config");
const Mail      = requireShared("models/mail");


const interval = Config["mail-server"].interval || 10000;
const processQueu = () => {
    Mail.sendFromQueu().then(res => {
        processQueu();
    })
    .catch(() => {
        setTimeout(processQueu, interval)
    })
}

processQueu();

module.exports = Mail;
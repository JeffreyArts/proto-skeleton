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
if (Config["mail-server"] && Config["mail-server"].smtp) {
    console.log(`Using: ${Config["mail-server"].smtp}`);
} else {
    console.log(``);
    console.log(`Please specify a smtp server first`);
    console.log(`config["mail-server"].smtp`);
}
module.exports = Mail;
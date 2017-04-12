"use strict";

const Config = require("config");
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(Config["mail-server"].smtp);

// setup e-mail data with unicode symbols
const mailOptions = {
    from: '"Test account" <prototypeskeleton@gmail.com>', // sender address
    to: "sjeffff@gmail.com", // list of receivers (comma seperated)
    subject: "Hello 🤔", // Subject line
    text: "Hello world ?", // plaintext body
    html: "<b>Hello world ?</b>" // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if(error){
        return console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
});

module.exports(transporter);
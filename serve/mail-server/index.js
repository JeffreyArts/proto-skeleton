/* global requireMail */
"use strict";

const Config        = require("config");
const nodemailer    = require("nodemailer");
const addMail       = requireMail("controllers/addMail.js");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(Config["mail-server"].smtp);

// setup e-mail data with unicode symbols
const mailOptions = {
    from: '"Test account" <prototypeskeleton@gmail.com>', // sender address
    to: "sjeffff@gmail.com", // list of receivers (comma seperated)
    subject: "Test 123", // Subject line
    text: "Text", // plaintext body
    html: "<b>HTML</b>" // html body
};



// addMail(mailOptions).catch(err => {
//     console.error(err);
// })






// send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//     if(error){
//         return console.log(error);
//     }
//     console.log(`Message sent: ${info.response}`);
// });

module.exports = transporter;
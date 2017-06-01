/* global requireMail, requireShared, requireDatamodel */
"use strict";

const Config            = require("config");
const fs                = require("fs");
const ejs               = require("ejs");
const sass              = require("node-sass");
const nodemailer        = require("nodemailer");
const moment            = require("moment");
const ObjectId          = require("promised-mongo").ObjectId;
const {merge}           = require("lodash");
const isValidMailObject = requireMail("validators/isValidMailObject");
const emailModel        = requireDatamodel("email");
const db                = requireShared("utilities/db");
const collection        = db.get("mailingQueu");


// const mail          = requireMail("controllers/sendMail.js")(nodemailer.createTransport(Config["mail-server"].smtp));
const transporter = nodemailer.createTransport(Config["mail-server"].smtp);

let templateDirectory = `./serve/mail-server/templates/default`;

const ejsToHtml = (filePath, data) => {
    const options = {
        cache: false,
        root: templateDirectory
    };

    return new Promise((resolve, reject) => {

        fs.readFile(filePath, err => {
            if (err) {
                return reject(err);
            }

            ejs.renderFile(filePath, data, options, (err, str) => {
                if (err) {
                    return reject(err);
                }

                return resolve(str)
            });
        });
    })
}


const scssToCss = inputFile => {
    const options = {
        file: inputFile
    };

    return new Promise((resolve, reject) => {

        fs.readFile(inputFile, err => {
            if (err) {
                return reject(err);
            }
            sass.render(options, (err, res) => {

                if (err) {
                    return reject(err);
                }

                return resolve(res.css.toString());
            });
        });
    });
}

module.exports = {
    add: mailObject => {
        return new Promise((resolve, reject) => {
            if (isValidMailObject(mailObject)) {
                // add mail to db
                const newMail = merge({}, emailModel, mailObject);
                newMail.created = moment.utc().unix();

                return collection.insert(newMail)
                .then(result => resolve(result))
                .catch(error => reject(error));
            }
            return reject(mailObject);
        })
    },
    send: mailObject => {
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailObject, (error, info) => {
                if(error){
                    return reject(error);
                }
                return resolve(info);
            });
        });
    },
    getMailObject: () => {
        return merge({}, emailModel);
    },
    getFromQueu: objectId => {
        let query = {};

        if (objectId) {
            query = {_id: ObjectId(objectId)}
        }

        return new Promise((resolve, reject) => {
            collection.findOne(query)
            .then(result => {
                return resolve(result)
            })
            .catch(error => {
                return reject(error)
            });
        });
    },
    sendFromQueu: function(objectId) {
        return new Promise((resolve, reject) => {
            this.getFromQueu(objectId).then(mailObject => {
                if (mailObject === null) {
                    return reject();
                }
                this.send(mailObject).then(() => {
                    collection.remove(ObjectId(mailObject._id))
                    .then(resolve)
                    .catch(console.error);
                })
                .catch(console.error);
            })
        })
    },
    getTemplate: (templateName, data) => {

        fs.readFile(`./serve/mail-server/templates/${templateName}`, err => {
            if (!err) {
                templateDirectory = `./serve/mail-server/templates/${templateName}`;
            }
        });

        return new Promise((resolve,reject) => {

            return Promise.all([
                ejsToHtml(`${templateDirectory}/${templateName}.ejs`, data),
                scssToCss(`${templateDirectory}/${templateName}.scss`)
            ])
            .then(v => {
                const html = v[0];
                const css = v[1];

                // Insert css as internal stylesheet
                resolve(html.replace(/<css>/, `<style>${css}</style>`))
            })
            .catch(err => {
                reject(err)
            })
        })
    }
}
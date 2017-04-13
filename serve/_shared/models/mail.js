/* global requireMail, requireShared, requireDatamodel */
"use strict";

const Config            = require("config");
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
}
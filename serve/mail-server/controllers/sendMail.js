/* global requireShared */

const db                = requireShared("utilities/db");
const collection        = db.get("mailingQueu");
const ObjectId          = require("promised-mongo").ObjectId;


module.exports = transporter => {
    const mail = {
        interval: 10000,
        getFromQueu: () => {
            return new Promise((resolve, reject) => {
                collection.findOne()
                .then(result => {
                    return resolve(result)
                })
                .catch(error => {
                    return reject(error)
                });
            });
        },
        sendFromQueu: () => {
            return new Promise((resolve, reject) => {
                mail.getFromQueu().then(mailObject => {
                    if (mailObject === null) {
                        return reject();
                    }

                    mail.send(mailObject)
                    .then(() => {
                        console.log();
                        collection.remove(ObjectId(mailObject._id))
                        .then(resolve)
                        .catch(console.error);
                    })
                    .catch(console.error);
                })
            })
        },
        processQueu: () => {
            mail.sendFromQueu()
            .then(mail.sendFromQueu)
            .catch(() => {
                setTimeout(mail.processQueu,mail.interval)
            })
        },
        send: mailObject => {
            return new Promise((resolve, reject) => {
                transporter.sendMail(mailObject, (error, info) => {
                    if(error){
                        return reject(error);
                    }
                    console.log("Succesfully sent");
                    return resolve(info);
                });
            });
        }
    };
    return mail;
};
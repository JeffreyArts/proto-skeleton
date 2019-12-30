/* global requireDatamodel, requireLocale */

const _             = require("lodash");
const moment        = require("moment");
const fs            = require("fs");
const writeFile     = require("write");
const errors        = requireLocale("en/errors");

const updateLogFile = (logFile, error) => {
    const errorsFile = fs.readFileSync(logFile, "utf-8");
    let newLine = `\r\n[${moment().format("DD/MM HH:mm:ss")}] ${error.message}`;
    if (error.details) {
        newLine += `- ${error.details}`;
    }
    writeFile(logFile, newLine + errorsFile)
}

const errorHandler = {
    processError: req => {
        req.resContent = {
            errorCode: req.error.message
        }

        if (req.error.details) {
            req.resContent.details = req.error.details;
        }
        
        const temp = errorHandler.getUserFriendlyMessage(req.error);
        if (_.isObject(temp) && temp.userMessage) {
            req.resContent.userMessage = temp.userMessage;
        }
        if (_.isObject(temp) && temp.devMessage) {
            req.resContent.devMessage  = temp.devMessage;
        }
    },
    getUserFriendlyMessage: err => {
        if (errors[err.message]) {
            return errors[err.message];
        }

        const logFile = "log/errors/en.txt";


        if (!fs.existsSync(logFile)) {
            writeFile(logFile, "").then(() => {
                updateLogFile(logFile, err)
            });
        } else {
            updateLogFile(logFile, err)
        }
    }
}

module.exports = errorHandler;
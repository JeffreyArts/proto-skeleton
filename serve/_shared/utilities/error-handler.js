/* global requireDatamodel, requireLocale */

const _             = require("lodash");
const moment        = require("moment");
const fs            = require("fs");
const writeFile     = require("write");
const Config        = require("config");
const errors        = requireLocale("en/errors");

const updateLogFile = (logFile, error) => {

    const errorsFile = fs.readFileSync(logFile, "utf-8");
    let newLine = `\r\n[${moment().format("DD/MM HH:mm:ss")}] ${error.message}`;
    if (error.details) {
        var details = error.details
        if (_.isObject(error.details)) {
            details = JSON.stringify(error.details)
        }
        newLine += `\r\n                 ${details}`;
    }

    if (errors[error.message] && errors[error.message].devMessage) {
        newLine += `\r\n                 ${errors[error.message].devMessage}`;
    }
    writeFile(logFile, newLine + errorsFile)
}

const errorHandler = {
    processError: req => {
        // Overwriting resContent is a necessity to prevent accidental leaks.
        req.resContent = {
            errorCode: req.error.message
        }

        if (req.error.details && Config['api-server'].strict == false) {
            req.resContent.details = req.error.details;
        }

        if (!_.isUndefined(req.error)) {
            const temp = errorHandler.getUserFriendlyMessage(req.error);

            if (temp) {
                req.resContent.userMessage = temp.userMessage;

                if (Config['api-server'].strict == false) {
                    req.resContent.devMessage  = temp.devMessage;
                }
            } else {
                console.error("Missing details for error", req.error.message)
            }
        }
        console.error(req.error);
    },
    getUserFriendlyMessage: err => {

        const logFile = "log/errors/en.txt";

        if (!fs.existsSync(logFile)) {
            writeFile(logFile, "").then(() => {
                updateLogFile(logFile, err)
            });
        } else {
            updateLogFile(logFile, err)
        }
        return errors[err.message]
    }
}

module.exports = errorHandler;
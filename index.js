"use strict";

global.requireShared = function(string) {
    return require(`${__dirname}/serve/_shared/${string}`);
}

global.requireApi = function(path) {
    return require(`${__dirname}/serve/api-server/${path}`);
}

global.requireSocket = function(path) {
    return require(`${__dirname}/serve/socket-server/${path}`);
}

global.requireMail = function(path) {
    return require(`${__dirname}/serve/mail-server/${path}`);
}

global.requireDatamodel = function(modelName) {
    return require(`${__dirname}/data-models/${modelName}`);
}

global.requireLocale = function(path) {
    return require(`${__dirname}/locales/${path}`);
}

const _ = require("lodash");



const serve = app => {
    const applicationMapping = {
        "init": "./serve/initialization",
        "socket-server": "./serve/socket-server",
        "mail-server": "./serve/mail-server",
        "api-server": "./serve/api-server"
    }

    if (app) {  
      app = app.toLowerCase();
    }

    if (typeof applicationMapping[app] != "undefined") {
        return require(applicationMapping[app]);
    } else {
        const options = [];
        _.each(applicationMapping, (value, key) => {
            options.push(key);
        })
        return console.error("Please add one of the following properties to run the corresponding script:\r\n", options);
    }
}


serve(process.argv[2]);

module.exports = serve;

/* global requireSocket */

"use strict";

const rjson = require("relaxed-json")
const _ = require("lodash");

module.exports = app => {
    const socket = app.socket
    const res = app.res;
    const nsp = app.namespace;


    socket.on("disconnect", () => {
        if (res.users[socket.id]) {
            delete res.users[socket.id];
        }
    })

    return {
        init: () => {
            if (typeof res.users !== "object") {
                res.users = {};
            }

            // Add user
            let user = {};
            if (process.env.NODE_ENV === "development") {
                user = { id: socket.id };
            }
            res.users[socket.id] = user;
        },
        update: () => {
            let props = socket.body;

            if (!_.isObject(props)) {
                 props = rjson.parse(socket.body);
            }

            if (!_.isObject(props)) {
                return console.error("user.update value should be of type object, is ", typeof socket.body + "(" + socket.body + ")");
            }

            _.each(props, (value, key) => {
                if (["id", "room"].indexOf(key) !== -1) {
                    return;
                }
                res.users[socket.id][key] = value;
            });

            socket.emit("user.current", res.users[socket.id])
        }
    };
};

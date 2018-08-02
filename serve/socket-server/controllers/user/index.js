/* global requireSocket */

"use strict";

const rjson = require("relaxed-json")
const _ = require("lodash");
const getuserObj = requireSocket("utilities/get-user-object");

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
            res.users[socket.id] = {id: socket.id};
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
                if (key == "room") {
                    return;
                }
                res.users[socket.id][key] = value;
            });


            const userObj = _.omit(getuserObj(socket, res), ["room"]);

            socket.emit("user.current", userObj)
        }
    };
};

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
        delete res.users[socket.id];
    })

    return {
        init: () => {
            if (typeof res.users !== "object") {
                res.users = {};
            }

            // Add user
            res.users[socket.id] = {};
        },
        update: () => {

            const props = rjson.parse(socket.body);

            if (typeof props !== "object") {
                return console.error("user.update value should be an object, is ", socket.body);
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

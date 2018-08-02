"use strict";

const _ = require("lodash");

module.exports = app => {
    const socket = app.socket;
    const res = app.res;

    return {
        namespace: (name, msg, room) => {
            if (_.isUndefined(room)) {
                room = res.users[socket.id].room;
            }
            app.namespace.in(room).emit(name, msg)
        },
        broadcast: (name, msg, room) => {
            if (_.isUndefined(room)){
                room = res.users[socket.id].room;
            }
            socket.broadcast.in(room).emit(name, msg)
        }
    }
};

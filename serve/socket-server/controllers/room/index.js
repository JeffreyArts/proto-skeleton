/* global requireSocket */
"use strict";

const _ = require("lodash");

module.exports = app => {
    const socket = app.socket;
    const res = app.res;
    const roomHelper   = requireSocket("utilities/room")(app);

    return {
        join: req => {
            const roomName = req.body;

            // Send message to old room that you have left
            if (!_.isUndefined(res.users[socket.id].room)) {
                const o = _.merge({},res.users[socket.id]);
                socket.leave(res.users[socket.id].room, () => {
                    roomHelper.broadcast("room.left", o, o.room);
                });
            }


            // Join new room
            res.users[socket.id].room = roomName;
            socket.join(roomName, err => {
                if (err) {
                    return console.error(err);
                }

                if (_.isObject(res.users)) {
                    roomHelper.namespace("room.joined", res.users[socket.id]);
                } else {
                    roomHelper.namespace("room.joined", socket.id);
                }
            });



            return this;
        },
        leave: () => {
            socket.leave(res.users[socket.id].room, () => {
                if (_.isObject(res.users)) {
                    roomHelper.namespace("room.left", res.users[socket.id]);
                } else {
                    roomHelper.namespace("room.left", socketId);
                }
            });
            return this;
        },
        current: () => {
            socket.emit("room.current.success", res.users[socket.id].room);
        },
        getUserlist: () => {
            const users = res.users;

            socket.emit("room.getUserlist.success", _(users).filter({
                room: users[socket.id].room
            }))
            return this;
        }
    };
};

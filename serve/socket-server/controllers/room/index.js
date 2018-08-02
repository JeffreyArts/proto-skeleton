/* global requireSocket */
"use strict";

const _ = require("lodash");
const getuserObj = requireSocket("utilities/get-user-object");

module.exports = app => {
    const socket = app.socket;
    const res = app.res;
    // const namespace = app.namespace;

    return {
        join: req => {
            const roomName = req.body;

            if (typeof res.users === "object" && typeof res.users[socket.id] === "object") {
                res.users[socket.id].room = roomName;
            }
            socket.join(roomName, err => {
                if (err) {
                    return console.error(err);
                }
                const userObj = _.pick(getuserObj(socket, res), ["socketId", "room"]);

                socket.emit("room.current", roomName);
            });



            return this;
        },
        leave: () => {
            const roomName = socket.body;
            const users = res.users;

            let user = null;
            if (typeof res.users === "object") {
                user = users[socket.id];
            }

            socket.leave(roomName, () => {
                if (user) {
                    // Notify others
                    socket.broadcast.emit("user.left", {
                        user: user,
                        users: _(users).filter({
                            room: socket.room
                        })
                    });

                    // Remove socket user from users list
                    delete users[socket.id];
                }
            });
            return this;
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

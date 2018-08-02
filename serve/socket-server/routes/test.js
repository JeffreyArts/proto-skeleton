"use strict";

module.exports = app => {

    // To self
    app.route("toSelf", socket => {
        socket.emit("toSelf.success", socket.body);
    })

    // To others (within the same namespace)
    app.route("toOthers", socket => {
        socket.broadcast.emit("toOthers.success", socket.body);
    });

    // To everyone (within the same namespace)
    app.route("toEveryone", socket => {
        app.namespace.emit("toEveryone.success", socket.body);
    });

    // Get list of users
    app.route("getUserlist", (socket, res) => {
        socket.emit("getUserlist.success", res.users);
    });

    // To everyone (within the same room)
    app.route("toEveryoneInRoom", socket => {
        app.namespace.in(socket.body).emit("toEveryoneInRoom.success", `Sending message to everyone in room ${socket.body}`);
    });

    // To others (within the same room)
    app.route("toOthersInRoom", (socket, res) => {
        socket.broadcast.in(res.room).emit("toOthersInRoom.success",socket.body);
    });

    return app;
};

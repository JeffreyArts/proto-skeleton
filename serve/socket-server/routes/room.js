/*global requireSocket */
"use strict";

const Room = requireSocket("controllers/room");

module.exports = app => {
    const room = Room(app);

    room.join("general");

    app.route("room.join", room.join)
       .route("room.leave", room.leave)
       .route("room.current", room.current)
       .route("room.getUserlist", room.getUserlist)

    return app;
};

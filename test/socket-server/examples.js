/* global describe, it */

const Config        = require("config"),
    socketIOclient  = require("socket.io-client");

let clientSocketA = {}; // on 'Config.socket-server.testPath' namespace, room: "A"
let clientSocketB = {}; // on 'Config.socket-server.testPath' namespace, room: "B"
let clientSocketC = {}; // on '/' namespace, room: "C"



////////////////////////////////////////////////////////////////////////////
// Connection
////////////////////////////////////////////////////////////////////////////

describe("Connection", () => {

    it(`userC should have an id after a succesfull socket connection`, () => {
        clientSocketC = socketIOclient(`ws://localhost:${Config["socket-server"].port}`);

        return new Promise((resolve, reject) => {
            clientSocketC.on("connect", content => {
                if (clientSocketC.io.engine.id !== null) {
                    return resolve(content)
                }

                return reject(clientSocketC.io.engine.id);
            });

            setTimeout(() => {
                return reject(false);
            }, 1500)
        })
    });

    it(`userA should have an id after a succesfull socket connection`, () => {
        clientSocketA = socketIOclient(`ws://localhost:${Config["socket-server"].port}${Config["socket-server"].testPath}`);

        return new Promise((resolve, reject) => {
            clientSocketA.on("connect", content => {
                if (clientSocketA.io.engine.id !== null) {
                    return resolve(content)
                }

                return reject(clientSocketA.io.engine.id);
            });

            setTimeout(() => {
                return reject(false);
            }, 500)
        })
    });

    it(`userB should have an id after a succesfull socket connection`, () => {
        clientSocketB = socketIOclient(`ws://localhost:${Config["socket-server"].port}${Config["socket-server"].testPath}`);

        return new Promise((resolve, reject) => {
            clientSocketB.on("connect", content => {
                if (clientSocketB.io.engine.id !== null) {
                    return resolve(content)
                }

                return reject(clientSocketB.io.engine.id);
            });

            setTimeout(() => {
                return reject(false);
            }, 1500)
        })
    });
});




////////////////////////////////////////////////////////////////////////////
// Setting up rooms
////////////////////////////////////////////////////////////////////////////

describe("Setting up rooms", () => {
    const path = "room.join";
    let data = "room.a";

    it(`userA should move to '${data}' when triggering '${path}' event`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketA.on(`room.current`, content => {
                if (content === data) {
                    resolve(content)
                }
            });

            setTimeout(() => {
                reject(false);
            }, 300)
        })
    });

    data = "room.b";
    it(`userB should move to '${data}' when triggering '${path}' event`, () => {
        clientSocketB.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketB.on(`room.current`, content => {
                if (content === data) {
                    resolve(content)
                }
            });

            setTimeout(() => {
                reject(false);
            }, 300)
        })
    });

    data = "room.c";
    it(`userC should move to '${data}' when triggering '${path}' event`, () => {
        clientSocketC.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketC.on(`room.current`, content => {
                if (content === data) {
                    resolve(content)
                }
            });

            setTimeout(() => {
                reject(false);
            }, 300)
        })
    });
});



////////////////////////////////////////////////////////////////////////////
// To Self
////////////////////////////////////////////////////////////////////////////

describe("toSelf", () => {
    const path = "toSelf";
    const data = "test-message";

    // User A
    it(`userA should receive a message when userA sends a message to the "toSelf" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketA.on(`${path}.success`, content => {
                if (content === data) {
                    resolve(content)
                }
            });

            setTimeout(() => {
                reject(false);
            }, 300)
        })
    });

    // User B
    it(`userB should NOT receive a message when userA sends a message to the "toSelf" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketB.on(`${path}.success`, () => {
                reject(false);
            });

            setTimeout(() => {
                resolve(true)
            }, 300)
        })
    });

    // User C
    it(`userC should NOT receive a message when userA sends a message to the "toSelf" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketC.on(`${path}.success`, () => {
                reject(false);
            });

            setTimeout(() => {
                resolve(true)
            }, 300)
        })
    });
});



////////////////////////////////////////////////////////////////////////////
// To Others
////////////////////////////////////////////////////////////////////////////

describe("toOthers", () => {
    const path = "toOthers";
    const data = "test-message";

    // User A
    it(`userA should NOT receive a message when userA sends a message to the "toOthers" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketA.on(`${path}.success`, content => {
                reject(content);
            });

            setTimeout(() => {
                resolve(true);
            }, 300)
        })
    });

    // User B
    it(`userB should receive a message when userA sends a message to the "toOthers" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketB.on(`${path}.success`, content => {
                resolve(content);
            });

            setTimeout(() => {
                reject(false)
            }, 300)
        })
    });

    // User C
    it(`userC should NOT receive a message when userA sends a message to the "toOthers" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketC.on(`${path}.success`, content => {
                reject(content);
            });

            setTimeout(() => {
                resolve(true);
            }, 300)
        })
    });
});



////////////////////////////////////////////////////////////////////////////
// To Everyone (within the same namespace)
////////////////////////////////////////////////////////////////////////////

describe("toEveryone", () => {
    const path = "toEveryone";
    const data = "test-message";

    // User A
    it(`userA should receive a message when userA sends a message to the "toEveryone" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketA.on(`${path}.success`, content => {
                resolve(content);
            });

            setTimeout(() => {
                reject(false);
            }, 300)
        })
    });

    // User B
    it(`userB should receive a message when userA sends a message to the "toEveryone" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketB.on(`${path}.success`, content => {
                resolve(content);
            });

            setTimeout(() => {
                reject(false)
            }, 300)
        })
    });

    // User C
    it(`userC should NOT receive a message when userA sends a message to the "toEveryone" endpoint`, () => {
        clientSocketA.emit(path, data);
        return new Promise((resolve, reject) => {
            clientSocketC.on(`${path}.success`, content => {
                reject(content)
            });

            setTimeout(() => {
                resolve(true);
            }, 300)
        })
    });
});
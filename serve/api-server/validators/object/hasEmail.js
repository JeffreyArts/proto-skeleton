module.exports = obj => new Promise((resolve, reject) => {
    if (typeof obj.email === "undefined") {

        const err = new Error("missingProperty");
        err.details = {
            properties: {
                property: "email"
            }
        };
        return reject(err);

    } else if (obj.email.indexOf("@") === -1) {
        const err = new Error("invalidProperty");
        err.details = {
            properties: {
                property: "email"
            }
        };
        return reject(err);
    }
    return resolve(true);

});

module.exports = obj => new Promise((resolve, reject) => {

    if (!obj.password) {
        const err = new Error("missingProperty");
        err.details = {
            properties: {
                property: "password"
            }
        };
        return reject(err);
    }
    return resolve(true);

});

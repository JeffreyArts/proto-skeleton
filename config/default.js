//
// WARNING
// Do not modify this file! Instead read the readme on how to do configuration!
//


module.exports = {
    /***************************************************************
    * Node Scripts
    ***************************************************************/
    "api-server": {

        //White-list of domains allowed to access our resources.
        cors: {
            acceptAll: false
        },

        //Plain-text HTTP server configuration.
        http: {
            enabled: true,
            host: "0.0.0.0",
            port: 3000
        },

        //Encrypted HTTP server configuration.
        https: {
            enabled: false,
            host: "0.0.0.0",
            port: 3443,
            key: null,
            cert: null
        },

        path: {
            auth: "/auth",
            accounts: "/accounts"
        }
    },

    "socket-server": {
        port: 3001,
        testPath: "/test"
    },

    "mail-server": {
        interval: 10000 // Amount of miliseconds between mails
    },

    "init": {
        directory: `${__dirname}/../serve/initialization/data`
    },

    /***************************************************************
    * Security
    ***************************************************************/
    "security": {

        //Please configure the secret on your deployment server. Every instance
        //must have the same secret, but the secret should not be comitted.
        secret: null,

        //Please note that the token-life also determines the time it takes for
        //changes in user-permissions to be propagated.
        tokenLife: 21600000,
        /*6 hours*/
        refreshLife: 1209600000 /*14 days*/

    },

    /***************************************************************
    * Database
    ***************************************************************/
    "mongodb": {
        database: null
    },

    /***************************************************************
    * Tests
    ***************************************************************/
    "test": {
        email: "test@test.com",
        password: "123456qwerty"
    }
};

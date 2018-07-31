//
// WARNING
// Do not modify this file! Instead read the readme on how to do configuration!
//


module.exports = {
    /***************************************************************
    * Node Scripts
    ***************************************************************/
    "api-server": {

        cors: {
            acceptAll: false, // Noob way, ignores "Access-Control-Allow-Origin" & "Access-Control-Allow-Headers" values
            origin: null,
            methods: null,
            headers: null
        },

        //Plain-text HTTP server configuration.
        http: {
            enabled: true,
            port: 3000
        },

        //Encrypted HTTP server configuration.
        https: {
            enabled: false,
            port: 3443,
            key: null, // Store outside repo!
            cert: null // Store outside repo!
        },

        path: {
            auth: "/auth",
            accounts: "/accounts"
        }
    },

    "socket-server": {
        port: 3001,
        testPath: "/test",
        path: "/",
        cors: {
            origin: "*:*"
        }
    },

    "mail-server": {
        interval: 10000, // Amount of miliseconds between mails
        smtp: null,
        appUrl: ""
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
        accessTokenLife: 21600, // 6 minutes
        refreshTokenLife: 1209600, // 14 days
        passwordResetTokenLife: 3600, // 1 hour
        hash: "HS256",
        facebook: {
            appId: null,
            appSecret: null,
            callbackURL: null
        },
        google: {
            appId: null,
            appSecret: null,
            callbackURL: null
        }
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

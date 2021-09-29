/* global requireApi */

const Config            = require("config");
const express           = require("express");
const isAuthorized      = requireApi("passport-strategies/jwt").authorize;
const localAuthorize    = requireApi("passport-strategies/local").authorize;

// Middleware
const isSelf            = requireApi("middleware/auth/is-self");
const setReturnUrl      = requireApi("middleware/auth/set-return-url");
const parseExtendQuery  = requireApi("middleware/parse-extend-query");
const sendRequest       = requireApi("middleware/send-request");
const uploadImage       = requireApi("middleware/upload/image");


module.exports = function(app) {
    var router = express.Router()


//////////////////////////////////////////////
// Home
//////////////////////////////////////////////
    router.get("/"                                                                                    , requireApi("controllers/home"), parseExtendQuery, sendRequest);

//////////////////////////////////////////////
// Accounts
//////////////////////////////////////////////
    router.post("/accounts"                                                                           , requireApi("controllers/account/create"), sendRequest);
    router.get("/accounts/:accountId"                     , isAuthorized, isSelf                      , requireApi("controllers/auth/me"), sendRequest);
    router.delete("/accounts/:accountId"                  , isAuthorized, isSelf                      , requireApi("controllers/account/delete"), sendRequest);
    router.patch("/accounts/:accountId"                   , isAuthorized, isSelf                      , requireApi("controllers/account/update"), sendRequest);

    router.get("/me"                                      , isAuthorized, isSelf                      , requireApi("controllers/auth/me"), sendRequest);
    router.post("/register"                                                                           , requireApi("controllers/account/create"), sendRequest);
    router.post("/request-password-reset"                                                             , requireApi("controllers/account/request-password-reset"), sendRequest);
    // For simple styling of html template: router.get("/accounts/:accountId/forgot-password"                                                 , requireApi("mail-controllers/account/forgot-password"));
    router.post("/auth/access-token"                                                                  , requireApi("controllers/auth/access-token"), sendRequest);

//////////////////////////////////////////////
// Authorization methods
//////////////////////////////////////////////

    // Local auth
    router.post("/auth"                                    , localAuthorize                            , requireApi("controllers/auth/refresh-token"), sendRequest);

    // Facebook auth
    if (Config.security.facebook && Config.security.facebook.clientID) {
        const facebookAuthorize = requireApi("passport-strategies/facebook").authorize;
        router.get("/auth/facebook"                        , setReturnUrl , facebookAuthorize         );
        router.get("/auth/facebook/callback"               , facebookAuthorize                        , requireApi("controllers/auth/refresh-token"));
    }
    // Google auth
    if (Config.security.google && Config.security.google.clientID) {
        const googleAuthorize   = requireApi("passport-strategies/google").authorize;
        router.get("/auth/google"                          , setReturnUrl, googleAuthorize            );
        router.get("/auth/google/callback"                 , googleAuthorize                          , requireApi("controllers/auth/refresh-token"));
    }


//////////////////////////////////////////////
// Upload
//////////////////////////////////////////////

    router.post("/upload/image"                           , isAuthorized, uploadImage                 , requireApi("controllers/upload/image"), sendRequest);
    router.get("/images/:imageId"                                                                     , requireApi("controllers/upload/get-image"), sendRequest);

    app.use(Config['api-server'].prefix,router);
    return app;
};

/* global requireApi */

const Config            = require("config");
const express           = require("express");
const sendRequest       = requireApi("middleware/send-request");
const parseExtendQuery  = requireApi("middleware/parse-extend-query");
const isAuthorized      = requireApi("passport-strategies/jwt").authorize;
const isSelf            = requireApi("middleware/auth/is-self");
const localAuthorize    = requireApi("passport-strategies/local").authorize;

// Middleware
const setReturnUrl = requireApi("middleware/auth/set-return-url");
const multer       = require("multer");
const upload       = multer({ dest: "uploads/" });


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
    router.post("/register"                                                                           , requireApi("controllers/account/create"), sendRequest);
    router.post("/accounts/request-password-reset"                                                    , requireApi("controllers/account/request-password-reset"), sendRequest);
    // For simple styling of html template: router.get("/accounts/:accountId/forgot-password"                                                 , requireApi("mail-controllers/account/forgot-password"));
    router.get("/me"                                      , isAuthorized                              , requireApi("controllers/auth/me"), sendRequest);
    router.get("/accounts/:accountId"                     , isAuthorized, isSelf                      , requireApi("controllers/auth/me"), sendRequest);
    router.post("/auth/access-token"                                                                  , requireApi("controllers/auth/access-token"), sendRequest);
    router.delete("/accounts/:accountId"                  , isAuthorized, isSelf                      , requireApi("controllers/account/delete"), sendRequest);
    router.post("/accounts/:accountId"                    , isAuthorized, isSelf                      , requireApi("controllers/account/update"), sendRequest);
    router.patch("/accounts/:accountId"                   , isAuthorized, isSelf                      , requireApi("controllers/account/update"), sendRequest);

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

    router.post("/upload/image"                           , isAuthorized, upload.single("image")      , requireApi("controllers/upload/image"));
    router.get("/images/:imageId"                                                                      , requireApi("controllers/upload/get-image"));

    app.use(Config['api-server'].prefix,router);
    
    
    app.use(function(req, res, next) {
        if (req.method == "OPTIONS") {
            return next();
        }
        req.error = new Error("endPointUnavailable");
        req.error.details = {
            endpoint: req.url
        }
        req.resStatus = 404;

        sendRequest(req,res,next)
    });
    
    return app;
};

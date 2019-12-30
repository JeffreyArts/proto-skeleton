/* global requireShared, requireApi*/

// server.js
// load the things we need
const app       = require("express")(),
    passport    = require("passport"),
    Config      = require("config"),
    routes      = require("./routes"),
    fs          = require("fs"),
    https       = require("https"),
    bodyParser  = require("body-parser"),
    session     = require("express-session"),
    Account     = requireShared("models/account"),
    db          = requireShared("utilities/db");

/***************************************************
    Passport cofiguration
***************************************************/

passport.serializeUser((user, cb) => {
    cb(null, user._id)
})

passport.deserializeUser((id, cb) => {
    // This code is not tested
    Account.getById(id)
    .then(user => {
        cb(null, user);
    })
    .catch(error => {
        cb(error);
    })
    //  This code is not tested ./
})

passport.use(requireApi("/passport-strategies/jwt").strategy);
passport.use(requireApi("/passport-strategies/local").strategy);
if (Config.security.facebook && Config.security.facebook.clientID) {
    passport.use(requireApi("/passport-strategies/facebook").strategy);
}
if (Config.security.google && Config.security.google.clientID) {
    passport.use(requireApi("/passport-strategies/google").strategy);
}
app.use(passport.initialize())
app.use(passport.session())






/***************************************************
    Cors cofiguration
***************************************************/

app.use((req, res, next) => {
    if (Config["api-server"].cors.acceptAll === true) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
        res.header("Access-Control-Allow-Headers", `Origin, X-Requested-With, Authorization, Content-Type, Options, Accept`);

        return next();
    }

    if (Config["api-server"].cors.origin) {
        res.header("Access-Control-Allow-Origin", Config["api-server"].cors.origin);
    }

    if (Config["api-server"].cors.methods) {
        res.header("Access-Control-Allow-Methods", Config["api-server"].cors.methods);
    }

    if (Config["api-server"].cors.headers) {
        res.header("Access-Control-Allow-Headers", Config["api-server"].cors.headers);
    }

    return next();
});


app.use((req, res, next) => {
    req.db = db;
    req.passport = passport
    req.vars = {
        NODE_ENV: process.env.NODE_ENV
    };
    next();
});

app.use(session({
    secret: Config.security.secret,
    resave: true,
    saveUninitialized: true
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


routes(app);



if (Config["api-server"].https.enabled) {
    const privateKey = fs.readFileSync( Config["api-server"].https.key );
    const certificate = fs.readFileSync( Config["api-server"].https.cert );

    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(Config["api-server"].https.port);

    console.log(`HTTPS server running on port ${Config["api-server"].https.port}`);
}

if (Config["api-server"].http.enabled) {
    app.listen(Config["api-server"].http.port);
    console.log(`HTTP server running on port ${Config["api-server"].http.port}`);
}

module.exports = app;
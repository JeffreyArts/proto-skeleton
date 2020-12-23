# About

This repo consist of 3 connected services, sharing code via the `shared` directory and all configureable via the config. It consists the following:

- API server
- Socket server
- Mail server

## General information about Config
The configuration of these services are handled by the beautiful [npm config package](https://www.npmjs.com/package/config). In short, don't touch default.js, use other files to configure your application. Use development.js for the development environment. Create a local.js configuration file to configure for you local machine. And use the production.js file for - you guessed it - the production environment. For more detailed information [check the docs](https://www.npmjs.com/package/config).

### Important config settings
Set the database:

`mongodb.database = "mongodb://127.0.0.1:27017/proto-skeleton"
`

Set a secret key (used for signing the JWT):

`security.secret = "randomstringofcharacters"`


---------------------

## API server

The api server is REST based with JSON webtokens for authentication and is build with Express. It has 3 different ways to authenticate with it on default and can be easily extended by adding more [Passport](http://passportjs.org/docs) strategies. The 3 default strategies (local, Facebook & Google) are configureable by the config under `security.hash`, `security.google` & `security.facebook`.

The API server has middleware for checking if the user is authenticated (`isAuthorized`), if the authenticated userId equals the resource userId (isSelf). And a few paths pre-defined, required for authentication. To use this feature you'll need to request the route with the following header set "`Authorization: JWT {AccessToken}`".

### Configuration

See the **config/default.js** section for most of the settings value (specifically within the ["api-server"]) part. The api-server also use values from the "security" & "mongodb" sections.

For setting up [Facebook](https://developers.facebook.com/docs/apps/register#developer-account) & [Google](https://console.developers.google.com/apis/credentials/oauthclient) authentication parameters you will need to add the following within the "security" section.

```
facebook: {
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:3000/auth/facebook/callback" // Or other domain where API server is deployed
},
google: {
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:3000/auth/google/callback" // Or other domain where API server is deployed
}
```
To specify a custom redirect url, you will need to specify it as a query parameter `/auth/facebook?redirectUrl=http://web.application.io` (this applies for `/auth/google` as well).


You can set the desired CORS header for _all_ requests by editing the `"api-server".cors` values.
"acceptAll" sets the values as followed:
```
"Access-Control-Allow-Origin" = "*"
"Access-Control-Allow-Headers" = "Origin, X-Requested-With, Content-Type, Options, Authorization, Accept"
```

If you prefer set them manually disable the "acceptAll" value by setting it's value to a falsey value. And modifiy `"api-server".cors['Access-Control-Allow-Origin']` & `"api-server".cors['Access-Control-Allow-Header']` manually.


### Run server

You can run the api server by calling the following command
```
node . api-server
```

### Error handling

On all API routes, there is a default way for managing errors. You can pass errors by creating an error object.
Errors can be created in the models, or in the controllers.

```
var err = new Error("example");
err.details = {details: "You can add all kind of details about the error if you'd wish."}
```

Errors will be published in the response to the public, in the console, as well as in a logfile. All errors can have descriptive information by adding them to the errors file, located at `locales/[language_code]/errors`. 

The `api-server.strict` boolean is meant for situations in which you want to remove certain functionalities for production, but  would like to keep them in the development environment. This feature is also implemented in the error handling. When strict = true, it won't show the dev message and the details of the error. Only the errorCode and the user message will be returned. This variable can also be used manually, in order to limit the user input on requests for example.


------------------
## Socket server

Pretty basic at the moment, the sockets implementation runs on top of Sockets.io. It has support for defining routes like you can do with Express. This enables it to support the powerfull [Connect](https://github.com/senchalabs/connect#readme)-style middleware.

### Configuration

You can configure the socket server similar to the api-server. But with some limitations. The port is pretty straight forward. The path is where the server can be found when the client wants to connect to it. This could be `/socket` for instance, but on default it is just `/`. Since the location of the socket server would be already unique cause it is on a separate port. The `cors.origin` is there to only allow access from a certain domain.

------------------
## Mail server

The mail server is a Nodemailer based service which continuously processes the mailing queue. This queue is stored in the Mongodb database within 'mailingQueu'. You can push e-mails to this queu by using Mail.add(mailObject), where mailObject is an object as specified in the `data-models/email.json`

### Configuration

You will need to configure the smtp connection to be able to send mails. The easiest and most straightforward way of doing so is [described on the website of nodemon](https://nodemailer.com/smtp/).
This string you will then add to the configuration as followed:

```
{
    ['mail-server']: {
        smtp: "smtps://user%40gmail.com:pass@smtp.gmail.com/?pool=true"
    }
}
```

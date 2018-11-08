var express = require('express');
var app = express();
var morgan = require('morgan');
var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
require('dotenv').config()
var bodyParser = require('body-parser')
var helper = require('./utils/helper');

var cookieParser = require('cookie-parser');

//const OAuth2Server = require('oauth2-server');

/**
 * To Log req in file
 */
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())
app.use(cookieParser())

/**
 * Request and response handler
 */
app.use(require('./utils/requestHandler'))
app.use(require('./utils/responseHandler'))

/**
 * Oauth2
 */

// app.oauth = new OAuth2Server({
//     debug: true,
//     model: require('./controllers/oauthModel'),
//     allowBearerTokensInQueryString: true,
//     accessTokenLifetime: 4 * 60 * 60
// });

// const Request = OAuth2Server.Request;
// const Response = OAuth2Server.Response;
// let request = new Request();
// let response = new Response();
//app.use(app.oauth.authorize());
/**
 * Handling cors
 */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,accessToken");
    next();
});
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.use('/', require('./routes'))

/**
 * Database connection and Started new server
 */
mongoose.connect(process.env.MONGO_URL, function(error) {
    if (error) {
        console.log("Error in connecting to database url=> ", process.env.MONGO_URL)
        console.log("Error in connecting to database, Error=> ", error)
        process.exit(1);
    }

    app.listen(process.env.PORT || 8080, function(err, obj) {
        if (err) {
            process.exit(1);
        }
        console.log("Server started on port: ", process.env.port || 8080)
    })
});

module.exports = app;
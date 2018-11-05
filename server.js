var express = require('express');
var app = express();
var morgan = require('morgan');
var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
require('dotenv').config()
var bodyParser = require('body-parser')
var helper = require('./utils/helper');
/**
 * To Log req in file
 */
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())


/**
 * Request and response handler
 */
app.use(require('./utils/requestHandler'))
app.use(require('./utils/responseHandler'))

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
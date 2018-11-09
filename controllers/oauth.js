var mongoose = require('mongoose');
var clientModel = require('../modals/clients');
var userModel = require('../modals/user');
var OAuthTokensModel = require('../modals/oauthTokens');
var md5 = require('md5');
var helper = require('../utils/helper');
var path = require('path')

// var express = require('express');
// var app = express();
const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

var oauth = require('../utils/oauth')

exports.createClient = function(req, res) {
    clientModel.create(req.body, function(err, data) {
        if (err) {
            console.log(err)
            res.sendError("ERR001", 500, err)
        } else {
            res.sendData('MSG001', 200, data);
        }
    })
}

exports.getClients = function(req, res) {
    clientModel.find(function(err, data) {
        if (err) {
            console.log(err)
            res.sendError("ERR001", 500, err)
        } else {
            res.sendData('MSG001', 200, data);
        }
    })
}
let authenticateHandler = {
    handle: function(request, response) {
        return userModel.findOne({ email: request.body.email, password: md5(request.body.password) }, function(err, data) {
            if (err) {
                console.log(err)
                response.sendError("ERR001", 500, err)
            } else {
                return data || false;
            }
        });
    }
};
exports.authorize = function(req, res, next) {
    console.log("authorize")
    res.cookie('client_id', req.query.client_id)
    res.cookie('response_type', req.query.response_type)
    res.cookie('state', req.query.state);
    res.cookie('scope', req.query.scope);


    if (req.headers.accesstoken) {
        next()
    } else {
        res.redirect('/oauth/render-login?response_type=' + req.query.response_type + '&state=' + req.query.state + '&client_id=' + req.query.client_id + '&redirect_uri=' + req.query.redirect_uri + '&scope=' + req.query.scope);
    }
}

exports.renderLogin = function(req, res) {
    res.sendFile(path.join(__dirname, '/../public/login.html'))
}

function loadCurrentUser(req) {
    userModel.findOne({ email: req.body.email, password: md5(req.body.password) }, function(err, data) {
        if (err) {
            console.log(err)
            res.sendError("ERR001", 500, err)
        } else {
            return data;
        }
    });
}
exports.postAuthorize = function(req, res) {

    req.query["client_id"] = req.cookies.client_id;
    req.query["state"] = req.cookies.state;
    req.query["response_type"] = req.cookies.response_type;
    req.query["scope"] = req.cookies.scope;
    var request = new Request(req);
    var response = new Response(res);
    oauth.authorize(request, response, { authenticateHandler: authenticateHandler }).then(function(success) {
        res.status(response.status).set(response.headers).end();
    }).catch(function(err) {
        res.status(err.code || 500).json(err)
    })


    // req.query["client_id"] = req.cookies.client_id;
    // req.query["state"] = req.cookies.state;
    // req.query["response_type"] = req.cookies.response_type;
    // req.query["scope"] = req.cookies.scope;
    // var request = new Request(req);
    // var response = new Response(res);
    // oauth.authorize(request, response, { authenticateHandler: authenticateHandler }).then(function(success) {
    //     //res.json(success)
    //     res.locals.oauth = { code: success.authorizationCode };
    //     //next();
    // }).catch(function(err) {
    //     res.status(err.code || 500).json(err)
    // })



    // userModel.findOne({ email: req.body.email, password: md5(req.body.password) }, function(err, data) {
    //     if (err) {
    //         console.log(err)
    //         res.sendError("ERR001", 500, err)
    //     } else {
    //         helper.generateToken(data, helper.expireDate(20), function(token) {
    //             // req.headers["Authorization"] = "Bearer " + token;
    //             req.query["client_id"] = req.cookies.client_id;
    //             // req.query["state"] = req.cookies.state;
    //             // req.query["response_type"] = req.cookies.response_type;
    //             // req.query["scope"] = req.cookies.scope;
    //             var request = new Request(req);
    //             var response = new Response(res);

    //             // var accessToken = new OAuthTokensModel({
    //             //     accessToken: token,
    //             //     accessTokenExpiresAt: new Date().setDate(new Date().getDate() + 20),
    //             //     client: req.cookies.client_id,
    //             //     clientId: req.cookies.client_id,
    //             //     refreshToken: token,
    //             //     refreshTokenExpiresAt: new Date().setDate(new Date().getDate() + 20),
    //             //     user: data,
    //             //     userId: data._id,
    //             // });
    //             // accessToken.save(function(err, data) {
    //             //     if (err) {
    //             //         res.status(err.code || 500).json(err)
    //             //     } else {
    //             //         oauth.authorize(request, response).then(function(success) {
    //             //             res.json(success)
    //             //         }).catch(function(err) {
    //             //             res.status(err.code || 500).json(err)
    //             //         })
    //             //     }
    //             // });

    //             oauth.authenticate(request, response).then(function(success) {
    //                 res.json(success)
    //             }).catch(function(err) {
    //                 res.status(err.code || 500).json(err)
    //             })
    //         })
    //     }
    // })
}

exports.accessToken = function(req, res, next) {
    console.log("accesstoken")
    var request = new Request(req);
    var response = new Response(res);

    oauth
        .token(request, response)
        .then(function(token) {
            // Todo: remove unnecessary values in response
            //return res.json(token)
            res.set(response.headers);
            res.json(response.body);
        }).catch(function(err) {
            return res.status(500).json(err)
        })
}

exports.oauthSecured = function(req, res) {
    console.log("in secured area");
    res.json({ message: "In secured area!" })
}
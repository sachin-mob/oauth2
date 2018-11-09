var express = require('express');
var app = express();
var router = express.Router();
var oauthController = require('../controllers/oauth')


var md5 = require('md5');
var userModel = require('../modals/user');

var oauth = require('../utils/oauth')
const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

// let authenticateHandler = {
//     handle: function(request, response) {
//         return userModel.findOne({ email: request.body.email, password: md5(request.body.password) }, function(err, data) {
//             if (err) {
//                 console.log(err)
//                 response.sendError("ERR001", 500, err)
//             } else {
//                 return data || false;
//             }
//         });
//     }
// };

// let authorizeHandler = function(req, res, next) {
//     req.query["client_id"] = req.cookies.client_id;
//     req.query["state"] = req.cookies.state;
//     req.query["response_type"] = req.cookies.response_type;
//     req.query["scope"] = req.cookies.scope;
//     var request = new Request(req);
//     var response = new Response(res);
//     oauth.authorize(request, response, { authenticateHandler: authenticateHandler }).then(function(success) {
//         res.status(response.status).set(response.headers).end();
//     }).catch(function(err) {
//         res.status(err.code || 500).json(err)
//     })
// }

let authenticateHandler = function(req, res, next) {
    let request = new Request(req);
    let response = new Response(res);
    return oauth.authenticate(request, response)
        .then(function(token) {
            res.locals.oauth = { token: token };
            next();
        })
        .catch(function(err) {
            // handle error condition
            console.log(err);
            res.status(500).json(err)
        });
}


router.post('/create-client', oauthController.createClient)
router.get('/get-clients', oauthController.getClients)

router.get('/authorize', oauthController.authorize);
router.post('/authorize', oauthController.postAuthorize);
router.get('/render-login', oauthController.renderLogin);
router.all('/access-token', oauthController.accessToken);

router.get('/oauth-secured', authenticateHandler, oauthController.oauthSecured);

module.exports = router;
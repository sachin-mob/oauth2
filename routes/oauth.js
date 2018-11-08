var express = require('express');
var app = express();
var router = express.Router();
var oauthController = require('../controllers/oauth')
var oauth = require('../utils/oauth')


router.post('/create-client', oauthController.createClient)
router.get('/get-clients', oauthController.getClients)

router.get('/authorize', oauthController.authorize);
router.post('/authorize', oauthController.postAuthorize);
router.get('/render-login', oauthController.renderLogin);
router.all('/access-token', oauthController.accessToken);

module.exports = router;
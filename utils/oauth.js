const OAuth2Server = require('oauth2-server');
module.exports = new OAuth2Server({
    debug: true,
    model: require('../controllers/oauthModel'),
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 4 * 60 * 60,
    grants: ['authorization_code'], //, 'password', 'refresh_token', 'client_credentials'
});
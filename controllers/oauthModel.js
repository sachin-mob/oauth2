var OAuthTokensModel = require('../modals/oauthTokens');
var OAuthClientsModel = require('../modals/clients');
var OAuthUsersModel = require('../modals/user');
var OAuthAuthcodeModel = require('../modals/oauthAuthCodes');

/**
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
    // Adding `.lean()`, as we get a mongoose wrapper object back from `findOne(...)`, and oauth2-server complains.
    return OAuthTokensModel.findOne({ accessToken: bearerToken }).lean();
};

/**
 * Get client.
 */

module.exports.getClient = function*(clientId, clientSecret) {
    // return OAuthClientsModel.findOne({ clientId: clientId, secret: clientSecret }, function(err, data) {
    //     if (err) {
    //         return null;
    //     } else {
    //         return data;
    //     }
    // });
    let params = { clientId: clientId };
    if (clientSecret) {
        params.secret = clientSecret;
    }
    return OAuthClientsModel.findOne(params, function(err, data) {
        if (err) {
            return false;
        } else {
            return {
                id: data.id,
                redirectUris: data.redirectUris,
                grants: data.grants
            };
        }
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function(refreshToken) {
    return OAuthTokensModel.findOne({ refreshToken: refreshToken }).lean();
};

/**
 * Get user.
 */

module.exports.getUser = function(username, password) {
    return OAuthUsersModel.findOne({ username: username, password: password }).lean();
};



/**
 * Save token.
 */

module.exports.saveAuthorizationCode = function(code, client, user) {
    return OAuthAuthcodeModel.create({
        authorization_code: code.authorizationCode,
        expires_at: code.expiresAt,
        redirect_uri: code.redirectUri,
        scope: code.scope,
        client_id: client.id,
        user_id: user._id
    }, function(err, authorizationCode) {
        if (err) {
            return null;
        } else {
            return {
                authorizationCode: authorizationCode.authorization_code,
                expiresAt: authorizationCode.expires_at,
                redirectUri: authorizationCode.redirect_uri,
                scope: authorizationCode.scope,
                client: { id: authorizationCode.client_id },
                user: { id: authorizationCode.user_id }
            }
        }
    })
}


module.exports.saveToken = function(token, client, user) {
    var accessToken = new OAuthTokensModel({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresOn,
        client: client,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresOn,
        user: user,
        userId: user._id,
    });
    // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
    return new Promise(function(resolve, reject) {
        accessToken.save(function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    }).then(function(saveResult) {
        // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
        saveResult = saveResult && typeof saveResult == 'object' ? saveResult.toJSON() : saveResult;

        // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
        var data = new Object();
        for (var prop in saveResult) data[prop] = saveResult[prop];

        // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
        data.client = data.clientId;
        data.user = data.userId;

        return data;
    });
};
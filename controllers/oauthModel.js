var OAuthTokensModel = require('../modals/oauthTokens');
var OAuthClientsModel = require('../modals/clients');
var OAuthUsersModel = require('../modals/user');
var OAuthAuthcodeModel = require('../modals/oauthAuthCodes');
var async = require('async');

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
    var authcode = new OAuthAuthcodeModel();
    authcode.authorization_code = code.authorizationCode,
        authcode.expires_at = code.expiresAt,
        authcode.redirect_uri = code.redirectUri,
        authcode.scope = code.scope,
        authcode.client_id = client.id,
        authcode.user_id = user._id

    return new Promise(function(resolve, reject) {
        authcode.save(function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    }).then(function(authorizationCode) {
        console.log(authorizationCode)
        return {
            authorizationCode: authorizationCode.authorization_code,
            expiresAt: authorizationCode.expires_at,
            redirectUri: authorizationCode.redirect_uri,
            scope: authorizationCode.scope,
            client: { id: authorizationCode.client_id },
            user: { id: authorizationCode.user_id }
        }
    });

    // let a = authcode.save(function(err, authorizationCode) {
    //     if (err) {
    //         return null;
    //     } else {
    //         console.log(authorizationCode)
    //         return {
    //             authorizationCode: authorizationCode.authorization_code,
    //             expiresAt: authorizationCode.expires_at,
    //             redirectUri: authorizationCode.redirect_uri,
    //             scope: authorizationCode.scope,
    //             client: { id: authorizationCode.client_id },
    //             user: { id: authorizationCode.user_id }
    //         }
    //     }
    // })
    // return a;
}


module.exports.saveToken = function(token, client, user) {
    var accessToken = new OAuthTokensModel({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        client: client,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        user: user,
        userId: user.id,
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

module.exports.getAuthorizationCode = function(authcode) {
    return new Promise(function(resolve, reject) {
        OAuthAuthcodeModel.findOne({ authorization_code: authcode })
            .populate('client_id')
            .populate('user_id')
            .exec(function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
    }).then(function(authcodedetails) {
        return {
            authorizationCode: authcodedetails.authorization_code,
            expiresAt: authcodedetails.expires_at,
            redirectUri: authcodedetails.redirect_uri,
            scope: authcodedetails.scope,
            client: authcodedetails.client_id, // with 'id' property
            user: authcodedetails.user_id
        };
    })
}

module.exports.revokeAuthorizationCode = function(authcode) {
    return new Promise(function(resolve, reject) {
        OAuthAuthcodeModel.deleteOne({ authorization_code: authcode.code }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    }).then(function(authcodedetails) {
        return authcode;
    })
}
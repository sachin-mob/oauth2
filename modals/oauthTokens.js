var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var oauthtokenSchema = new mongoose.Schema({
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    client: { type: Object }, // `client` and `user` are required in multiple places, for example `getAccessToken()`
    clientId: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    user: { type: Object },
    userId: { type: String },
})

oauthtokenSchema.plugin(timestamps);

module.exports = mongoose.model('oauthtokens', oauthtokenSchema)
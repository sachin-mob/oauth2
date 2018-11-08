var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var authcodeSchema = new mongoose.Schema({
    authorization_code: String,
    expires_at: String,
    redirect_uri: String,
    scope: String,
    client_id: String,
    user_id: String
})

authcodeSchema.plugin(timestamps);

module.exports = mongoose.model('authcodes', authcodeSchema)
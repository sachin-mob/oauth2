var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var authcodeSchema = new mongoose.Schema({
    authorization_code: String,
    expires_at: Date,
    redirect_uri: String,
    scope: String,
    client_id: { type: Schema.Types.ObjectId, ref: 'clients' },
    user_id: { type: Schema.Types.ObjectId, ref: 'users' }
})

authcodeSchema.plugin(timestamps);

module.exports = mongoose.model('authcodes', authcodeSchema)
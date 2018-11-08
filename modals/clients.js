var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var uniqueValidator = require('mongoose-unique-validator');

var clientSchema = new mongoose.Schema({
    clientId: { type: String, unique: true },
    secret: String,
    redirectUris: { type: Array },
    grants: { type: Array }
})
clientSchema.plugin(uniqueValidator);
clientSchema.plugin(timestamps);

module.exports = mongoose.model('clients', clientSchema)
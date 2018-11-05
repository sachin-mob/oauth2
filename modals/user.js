var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
})
userSchema.plugin(uniqueValidator);
userSchema.plugin(timestamps);

module.exports = mongoose.model('users', userSchema)
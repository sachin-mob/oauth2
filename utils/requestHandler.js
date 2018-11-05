var _ = require('underscore');
var async = require('async');

module.exports = (req, res, next) => {
    req.validate = (rules, body, cb) => {
        var errors = [];
        async.each(
            rules,
            function(item, callback) {
                var errMsg = [];
                async.parallel([
                    function(cb) {
                        //Required
                        if (item.required && !body[item.key]) {
                            errMsg.push(item.key + " is required!");
                            cb();
                        } else {
                            cb()
                        }
                    },
                    function(cb) {
                        //Email
                        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (item.email && body[item.key] && !re.test(body[item.key])) {
                            errMsg.push(item.key + " should be correct email address!");
                            cb();
                        } else {
                            cb()
                        }
                    },
                    function(cb) {
                        //MinLength
                        if (item.minLength && body[item.key] && (body[item.key].length < item.minLength)) {
                            errMsg.push("Length of " + item.key + " should be greater than " + item.minLength);
                            cb();
                        } else {
                            cb()
                        }
                    }
                ], function(error, result) {
                    if (errMsg.length) {
                        errors.push({ key: item.key, messages: errMsg })
                    }
                    callback();
                })

            },
            function(err) {
                cb(errors)
            }
        )
    }
    next();
}
var mongoose = require('mongoose');
var userModel = require('../modals/user');
var md5 = require('md5');
var helper = require('../utils/helper');
exports.login = function(req, res) {
    console.log(req.body)
    req.validate([{
        key: 'email',
        required: true,
        email: true
    }, {
        key: 'password',
        required: true,
        minLength: 6
    }], req.body, function(validations) {
        if (validations.length) {
            res.sendError("ERR002", 422, validations)
        } else {
            userModel.findOne({ email: req.body.email, password: md5(req.body.password) }, function(err, data) {
                if (err) {
                    console.log(err)
                    res.sendError("ERR001", 500, err)
                } else {
                    helper.generateToken(data, helper.expireDate(20), function(token) {
                        res.sendData('MSG001', 200, { data: data, accessToken: token });
                    })
                }
            })
        }
    });
}
var jwt = require('jwt-simple');

exports.generateToken = function(data, exp, callback) {
    callback(jwt.encode({ data: data, exp: exp }, process.env.TOKEN_SECRET));
}

exports.expireDate = function(hours) {
    return new Date().setHours(parseInt(new Date().getHours()) + hours);
}
exports.getToken = function(token, callback) {
    callback(jwt.decode(token, process.env.TOKEN_SECRET));
}

exports.authorize = function(req, res, next) {
    //console.log("in secure", req.headers)
    if (req.headers && !req.headers.accesstoken) {
        res.sendError("ERR003", 401, null)
    } else {
        getToken(req.headers.accesstoken, function(user) {
            if (new Date().getTime() > user.exp) {
                res.sendError("ERR004", 401, null)
            } else {
                req.user = user.data;
                next();
            }
        })
    }
}

function getToken(token, callback) {
    callback(jwt.decode(token, process.env.TOKEN_SECRET));
}
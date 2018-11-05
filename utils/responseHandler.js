var messages = require("./responseMessages");
var errorMessages = require("./responseErrMessages");

module.exports = (req, res, next) => {
    res.sendError = (errMsgCode, errStatusCode, data) => {
        res.status(errStatusCode).json({ message: errorMessages[errMsgCode], success: false, data: data })
    };
    res.sendData = (msgCode, statusCode, data) => {
        res.status(statusCode).json({ message: messages[msgCode], success: true, data: data })
    };
    next();
}
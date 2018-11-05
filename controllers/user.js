var mongoose = require('mongoose');
var userModel = require('../modals/user');
var md5 = require('md5');
var fs = require('fs');
var path = require('path');
exports.create = function(req, res) {
    req.validate([{
        key: 'name',
        required: true
    }, {
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
            req.body.password = md5(req.body.password);
            userModel.create(req.body, function(err, data) {
                if (err) {
                    console.log(err)
                    res.sendError("ERR001", 500, err)
                } else {
                    res.sendData('MSG001', 200, data);
                }
            })
        }
    })
}

exports.getAll = function(req, res) {
    userModel.find(req.body, function(err, data) {
        if (err) {
            res.sendError("ERR001", 500, null)
        } else {
            res.sendData('MSG002', 200, data);
        }
    })
}

exports.getOne = function(req, res) {
    userModel.findOne({ _id: req.params.userId }, function(err, data) {
        if (err) {
            res.sendError("ERR001", 500, null)
        } else {
            res.sendData('MSG002', 200, data);
        }
    })
}

exports.update = function(req, res) {
    console.log(req.body)
    delete req.body.password
    delete req.body._id;
    userModel.updateOne({ _id: req.params.userId }, { $set: req.body }, { new: true }, function(err, data) {
        if (err) {
            console.log(err)
            res.sendError("ERR001", 500, null)
        } else {
            res.sendData('MSG003', 200, data);
        }
    })
};

exports.delete = function(req, res) {
    userModel.deleteOne({ _id: req.params.userId }, function(err, data) {
        if (err) {
            console.log(err)
            res.sendError("ERR001", 500, null)
        } else {
            res.sendData('MSG004', 200, data);
        }
    })
}
exports.streaming = function(req, res) {

    const filepath = __dirname + '/../public/video.mp4'
    const stat = fs.statSync(filepath)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ?
            parseInt(parts[1], 10) :
            fileSize - 1
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(filepath, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(filepath).pipe(res)
    }


}
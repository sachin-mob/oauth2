var express = require('express');
var app = express();
var router = express.Router();
var authController = require('../controllers/auth')


router.post('/login', authController.login)

module.exports = router;
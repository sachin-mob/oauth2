var express = require('express');
var auth = require('./auth')
var user = require('./user');
var helper = require('../utils/helper');

var router = express.Router();

router.use('/auth', auth);
router.use('/users', user);

module.exports = router;
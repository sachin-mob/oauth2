var express = require('express');
var auth = require('./auth')
var user = require('./user');
var helper = require('../utils/helper');
var oauth = require('./oauth');
var router = express.Router();

router.use('/auth', auth);
router.use('/users', user);
router.use('/oauth', oauth);

module.exports = router;
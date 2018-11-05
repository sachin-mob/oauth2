var express = require('express');
var router = express.Router();
var userController = require('../controllers/user')
var helper = require('../utils/helper');
router.post('/create', userController.create);
router.get('/get-all', helper.authorize, userController.getAll);
router.get('/get-one/:userId', userController.getOne);
router.put('/update/:userId', userController.update);
router.delete('/delete/:userId', userController.delete);
router.get('/streaming', userController.streaming)

module.exports = router;
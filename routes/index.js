var express = require('express');
var router = express.Router();
var debug = require('../server/utils');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Works!' });
    debug.log('Main page is working');
});

router.post('/TGWebhook', function(req, res, next) {
    var params = req.body;
    debug.log(params);
});

module.exports = router;

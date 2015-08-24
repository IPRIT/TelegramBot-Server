var express = require('express');
var router = express.Router();
var debug = require('../server/utils');
var TGHandler = require("../server/handler");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Works!' });
    debug.log('Main page is working');
});

router.post('/TGWebhook', function(req, res, next) {
    var params = req.body;
    debug.log(params);
    TGHandler.handler(req, res);
});

module.exports = router;

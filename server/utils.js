/**
 * Created by Aleksandr Belov 25.06.2015.
 */
var http = require("http");
var bl = require("bl");


module.exports = {
    log: Logger,
    http: {
        get: httpRequest
    }
};

function Logger() {
    var zeroFill = function(num) {
        return num < 10 ? '0' + num.toString() : num.toString();
    };
    var serverTime = new Date(),
        mskOffset = 3;
    var args = Array.prototype.slice.call(arguments),
        date = new Date(serverTime.getTime() + serverTime.getTimezoneOffset() * 60 * 1000 + mskOffset * 3600 * 1000),
        curTime = '[' + zeroFill(date.getHours()) + ':' + zeroFill(date.getMinutes()) +
            ':' + zeroFill(date.getSeconds()) + ']';
    args.unshift(curTime);
    console.log.apply(console, args);
}

function httpRequest(url, params, cb) {
    function httpGet(url, callback) {
        var result = '';
        http.get(url, function(res) {
            res.setEncoding('utf8');
     
            res.pipe(bl(function(err, data) {
                result += data.toString();
            }));
     
            res.on('error', function(e) {
                callback(e);
            });
     
            res.on('end', function() {
                callback(null, result);
            });
        });
    };
    
    function encodeParams(params) {
        var pairs = [];
        for (var el in params) {
            if (!params.hasOwnProperty(el)) continue;
            pairs.push(el + '=' + encodeURIComponent(params[el]));
        }
        return pairs.join('&');
    }
    
    url += '?' + encodeParams(params);
    
    httpGet(url, function(err, response) {
        if (err) {
            return cb(true);
        }
        return cb(false, response);
    })
}
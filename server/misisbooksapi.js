var utils = require("./utils");
var base64_encode = require('base64').encode;
var Buffer = require('buffer').Buffer;

module.exports = {
    search: Search,
    getDocument: GetDocument,
    getPopular: Popular
};

var config = {
    access_token: '120e21c6442fca2bb3d36a39f7abad05579eeca873ea36c5f0ec18c65c860f1f',
    api_url: 'http://twosphere.ru/api'
};

function Search(q, callback, count, offset, category, fields) {
    category = category || 1;
    fields = fields || 'all';
    offset = offset || 0;
    count = count || 32;
    q = q.trim();
    
    var methodUrl = config.api_url + '/materials.search';
    var params = {
        q: q,
        count: count,
        offset: offset,
        category: category,
        fields: fields,
        access_token: config.access_token
    };
    
    utils.http.get(methodUrl, params, function(err, response) {
        if (err) {
            return callback(true);
        }
        var response = JSON.parse(response).response;
        callback(false, response);
    });
}

function Popular(callback, count, offset, category, fields) {
    category = category || 1;
    fields = fields || 'all';
    offset = offset || 0;
    count = count || 50;
    
    var methodUrl = config.api_url + '/materials.getPopular';
    var params = {
        count: count,
        offset: offset,
        category: category,
        fields: fields,
        access_token: config.access_token
    };
    
    utils.http.get(methodUrl, params, function(err, response) {
        if (err) {
            return callback(true);
        }
        var response = JSON.parse(response).response;
        callback(false, response);
    });
}

function GetDocument(edition_id, callback, fields) {
    fields = fields || 'all';
    var methodUrl = config.api_url + '/materials.getDocument';
    var params = {
        edition_id: edition_id,
        fields: fields,
        access_token: config.access_token
    };
    
    utils.http.get(methodUrl, params, function(err, response) {
        if (err) {
            return callback(true);
        }
        var response = JSON.parse(response).response;
        if (!response || !response.items || !response.items.length) {
            return callback(true);
        }
        callback(false, response);
    });
}
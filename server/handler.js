var utils = require("./utils");
var MisisBooksApi = require("./misisbooksapi");
var unirest = require('unirest');
var botan = require('botanio')('88657');
var uniqChats = {};

module.exports = {
    handler: function(req, res) {
        var params = req.body;
        if (!params.update_id) {
            return res.end();
        }
        if (params.message && params.message.text) {
            var messageText = params.message.text.trim();
            var words = messageText.split(' ');
            var commandName = words[0];
            var cmdParams = words.slice(1, words.length);
            
            uniqChats['chat_' + params.message.chat.id] = (uniqChats['chat_' + params.message.chat.id] ? uniqChats['chat_' + params.message.chat.id] + 1 : 0);
            utils.log('Всего чатов: ' + Object.keys(uniqChats).length);
            
            if (/^(\/search(\@misis_bot)?)$/i.test(commandName)) {
                var searchText = cmdParams.join(' ');
                this.sendChatAction(params.message.chat.id, 'typing');
                var _this = this;
                
                botan.track(params.message, 'Search');
                
                return MisisBooksApi.search(searchText, function(err, resultObj) {
                    if (err) {
                        return res.end();
                    }
                    if (!resultObj || !resultObj.items) {
                        return _this.sendNotFoundMessage(req, res, resultObj);
                    }
                    _this.sendSearchResponse(req, res, {
                        items: Array.isArray(resultObj.items) ? resultObj.items: [],
                        q: resultObj.q,
                        all_items_count: resultObj.all_items_count
                    });
                    _this.sendNotificationToMe(req, res, {
                        type: 'search',
                        q: resultObj.q
                    });
                })
            }
            
            if (/^(\/popular(\@misis_bot)?)$/i.test(commandName)) {
                var searchText = cmdParams.join(' ');
                this.sendChatAction(params.message.chat.id, 'typing');
                var _this = this;
                
                botan.track(params.message, 'Popular');
                
                return MisisBooksApi.getPopular(function(err, resultObj) {
                    if (err) {
                        return res.end();
                    }
                    if (!resultObj.items) {
                        return _this.sendNotFoundMessage(req, res, resultObj);
                    }
                    _this.sendPopularResponse(req, res, {
                        items: Array.isArray(resultObj.items) ? resultObj.items: [],
                        all_items_count: resultObj.all_items_count
                    });
                    _this.sendNotificationToMe(req, res, {
                        type: 'popular'
                    });
                })
            }
            
            if (messageText && !/\(id\:\s?\d+\)/i.test(messageText) && !/^(\/start(\@misis_bot)?)$/i.test(commandName) && !/^(\/)/i.test(commandName)) {
                var searchText = messageText;
                this.sendChatAction(params.message.chat.id, 'typing');
                var _this = this;
                
                botan.track(params.message, 'Native search');
                
                return MisisBooksApi.search(searchText, function(err, resultObj) {
                    if (err) {
                        return res.end();
                    }
                    if (!resultObj || !resultObj.items) {
                        return _this.sendNotFoundMessage(req, res, resultObj);
                    }
                    _this.sendSearchResponse(req, res, {
                        items: Array.isArray(resultObj.items) ? resultObj.items: [],
                        q: resultObj.q,
                        all_items_count: resultObj.all_items_count
                    });
                    _this.sendNotificationToMe(req, res, {
                        type: 'search',
                        q: resultObj.q
                    });
                })
            }
            
            if (messageText && /\(id\:\s?\d+\)/i.test(messageText)) {
                var docId = messageText.match(/\(id\:\s?(\d+)\)/i)[1];
                this.sendChatAction(params.message.chat.id, 'upload_document');
                var _this = this;
                
                botan.track(params.message, 'Downloading');
                
                return MisisBooksApi.getDocument(docId, function(err, resultObj) {
                    if (err) {
                        return res.end();
                    }
                    _this.sendDocumentLink(req, res, {
                        name: resultObj.items[0].name,
                        dl_url: resultObj.items[0].download_url
                    });
                });
            }
            if (!/^(\/)/i.test(commandName)) {
                this.sendRules(req, res);
                botan.track(params.message, 'Sending rules');
            }
        }
        res.end();
    },
    sendSearchResponse: function(req, res, params) {
        var requestParams = req.body;
        
        var items = [];
        
        for (var i = 0; i < params.items.length; ++i) {
            items.push([params.items[i].name + ' (id: ' + params.items[i].id + ')']);
        }
        
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": requestParams.message.chat.id,
                "text": "По запросу «" + params.q + "» найдено документов: " + params.all_items_count,
                "disable_web_page_preview": true,
                "reply_to_message_id": requestParams.message.message_id,
                "one_time_keyboard": true,
                "reply_markup": JSON.stringify({
                    "keyboard": items
                })
            })
            .end(function (response) {
                console.log(response.body);
                res.end();
            });
    },
    sendPopularResponse: function(req, res, params) {
        var requestParams = req.body;
        
        var items = [];
        
        for (var i = 0; i < params.items.length; ++i) {
            items.push([params.items[i].name + ' (id: ' + params.items[i].id + ')']);
        }
        
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": requestParams.message.chat.id,
                "text": "Показаны самые популярные материалы.",
                "disable_web_page_preview": true,
                "reply_to_message_id": requestParams.message.message_id,
                "one_time_keyboard": true,
                "reply_markup": JSON.stringify({
                    "keyboard": items
                })
            })
            .end(function (response) {
                console.log(response.body);
                res.end();
            });
    },
    sendNotFoundMessage: function(req, res, params) {
        var requestParams = req.body;
        
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": requestParams.message.chat.id,
                "text": params && params.q && params.q.length ? "По запросу «" + params.q + "» ничего не найдено" : "Задан пустой поисковый запрос. Введите /search и Ваш текст для поиска сразу после пробела.",
                "disable_web_page_preview": true,
                "reply_to_message_id": requestParams.message.message_id
            })
            .end(function (response) {
                console.log(response.body);
                res.end();
            });
    },
    sendDocumentLink: function(req, res, params) {
        var requestParams = req.body;
        
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": requestParams.message.chat.id,
                "text": params.name + ': ' + params.dl_url,
                "reply_to_message_id": requestParams.message.message_id,
                "reply_markup": JSON.stringify({
                    hide_keyboard: true
                })
            })
            .end(function (response) {
                console.log(response.body);
                res.end();
            });
    },
    sendChatAction: function(chat_id, action) {
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendChatAction')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": chat_id,
                "action": action
            }).end(function(response) {
                console.log(response.body);
            });
    },
    sendRules: function(req, res) {
        var requestParams = req.body;
        
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": requestParams.message.chat.id,
                "text": requestParams.message.chat.id < 0 ? "Введите /search и Ваш текст для поиска сразу после пробела." : "Введите Ваш текст для поиска.",
                "disable_web_page_preview": true,
                "reply_to_message_id": requestParams.message.message_id
            })
            .end(function (response) {
                console.log(response.body);
                res.end();
            });
    },
    sendNotificationToMe: function(req, res, params) {
        var chat_id = 615945;
        
        this.sendChatAction(chat_id, 'typing');
        
        var requestParams = req.body;
        
        function getFullName(from) {
            return (from.first_name ? from.first_name : 'Unknown') + (from.last_name ? (' ' + from.last_name) : '');
        }
        
        var message = getFullName(requestParams.message.from) + " получил популярное.";
        if (params.type === 'search') {
            message = getFullName(requestParams.message.from) + " сделал запрос «" + params.q + "».";
        }
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/sendMessage')
            .header('Accept', 'application/json')
            .send({ 
                "chat_id": chat_id,
                "text": message
            })
            .end(function (response) {
                console.log(response.body);
                res.end();
            });
    },
    init: function() {
        unirest.post('https://api.telegram.org/bot114633843:AAFLWQ2lhepMlT1w4zFyGlWpZD4PzmKnHoU/setWebhook?url=https://telegrambot-server-ipritoflex.c9.io/TGWebhook')
            .header('Accept', 'application/json')
            .end(function (response) {
                console.log("Webhook inited");
            });
    }
}

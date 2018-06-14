const line = require('@line/bot-sdk');
const express = require('express');
const request = require('request');
const lineConfig = {
    channelAccessToken: process.env.HEROKU_LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.HEROKU_LINE_CHANNEL_SECRET
};
const client = new line.Client(lineConfig);
const app = express();
//const url = 'https://minkch.com/search/%E5%B7%A8/page/'
const url = 'https://minkch.com/archives/category/%E3%82%A8%E3%83%AD%E5%86%99%E3%83%A1%E3%83%BB%E8%87%AA%E6%92%AE%E3%82%8A/page/'
const cheerio = require('cheerio');


app.listen(process.env.PORT || 3000, function () {
    //console.log('App now running on port', this.address().port);
});

app.post('/', line.middleware(lineConfig), function (req, res) {
    Promise
    .all(req.body.events.map(handleEvent))
    .then(function (result) {
        res.json(result);
    });
});

app.get('/web', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<html><head><title>Line Messenger Bot</title></head><body><h1>Running</body></html>');
    res.end();
});

function handleEvent(event) {
    console.log(event);
    if (event.source.groupId =="C9d4217ab1336abd7d747c53bf7480a66"){
    switch (event.type) {
        case 'join':
            break
        case 'follow':
            //return client.replyMessage(event.replyToken, {
            //    type: 'text',
            //    text: '你好請問我們認識嗎?'
            //});
            break
        case 'message':
            switch (event.message.type) {
                case 'text':
                    switch (true) {                        
                        case (event.message.text.indexOf("抽") >= 0):
                            var Randurl = url + getRandomIntInclusive(1, 277);
                            request(Randurl, (err, res, body) => {
                                const $ = cheerio.load(body);
                                let posts = [];
                                $('.entry-title a').each(function (i, elem) {
                                    posts.push($(this).attr("href"))
                                })
                                Randurl = posts[getRandomIntInclusive(0, posts.length - 1)];
                                request(Randurl, (err, res, body) => {
                                    const $ = cheerio.load(body);
                                    let img = [];
                                    $('.pict').each(function (i, elem) {
                                        img.push($(this).attr("src"))
                                    })
                                    var rplink = img[getRandomIntInclusive(0, img.length - 1)]
                                    pushMessage("https:" + rplink, replyType.image, event);
                                })
                            })
                            break;
                        //case (event.message.text.indexOf("恕我攔轎") >= 0):
                        //    replyMessage("漱漱漱", replyType.text, event);
                        //    //pushMessage("https://img.technews.tw/wp-content/uploads/2015/09/Google-logo_1.jpg", replyType.image, event);
                        //    break;
                        case (event.message.text.indexOf("幹") >= 0):
                            //replyMessage("幹什麼幹阿...？", replyType.text, event);
                            replySticker('7', replyType.sticker, event);
                            break;
                        case (event.message.text.indexOf("靠") >= 0):
                            replyMessage("北邊走一點", replyType.text, event);
                            break;
                        case (event.message.text.indexOf("**") >= 0):
                            pushMessage("https://api.tiktokv.com/aweme/v1/playwm/?video_id=v07025ea0000bcfluhbdctmo76qscb90&line=0", replyType.video, event);
                            break;
                        case (event.message.text.indexOf("星星點燈") >= 0):
                            pushMessage("https://www.youtube.com/watch?v=nSFEUPJM8LI", replyType.video, event);
                            break;
                        case (event.message.text.indexOf("位置") >= 0 || event.message.text.indexOf("哪") >= 0 || event.message.text.indexOf("那裡") >= 0):
                            replyUri("哩低對?", replyType.uri, event);
                            break;
                        default:
                            switch (true) {
                                case (event.message.text.indexOf("包大人") >= 0):
                                    replyCarouselTemplateFormMinkch10(event)
                                    break;
                            }
                            
                            break;
                    }
            }
            break;
        case "postback":
            var PostUser = "";
            //console.log(event.source.type);
            var UserInfo;
            if (event.source.type == "group") {
                UserInfo = client.getGroupMemberProfile(event.source.groupId, event.source.userId)
                UserInfo.then(function (value) {
                    //console.log(value.displayName);
                    PostUser = value.displayName;
                    replyMessage(PostUser + " 你的圖來了！", replyType.text, event);
                    Randurl = event.postback.data;
                    request(Randurl, (err, res, body) => {
                        const $ = cheerio.load(body);
                        $('.pict').each(function (i, elem) {
                            pushMessage($(this).attr("src"), replyType.image, event);
                            })
                        })
                    }
                )
            }
            else if (event.source.type == "room") {
                UserInfo = client.getRoomMemberProfile(event.source.roomId, event.source.userId)
                UserInfo.then(function (value) {
                    //console.log(value.displayName);
                    PostUser = value.displayName;
                    replyMessage(PostUser + " 你的圖來了！", replyType.text, event);
                    Randurl = event.postback.data;
                    request(Randurl, (err, res, body) => {
                        const $ = cheerio.load(body);
                        $('.pict').each(function (i, elem) {
                            pushMessage($(this).attr("src"), replyType.image, event);
                        })
                    })
                    }
                )
            }
            else
            {
                replyMessage(" 你的圖來了！", replyType.text, event);
                Randurl = event.postback.data;
                request(Randurl, (err, res, body) => {
                    const $ = cheerio.load(body);
                    $('.pict').each(function (i, elem) {
                        pushMessage($(this).attr("src"), replyType.image, event);
                    })
                })

            }
            //console.log(UserInfo);
            break
            }
        }
}

function replyMessage(msg, type, event) {
    return client.replyMessage(event.replyToken, {
        type: type,
        text: msg
    });
}

function replySticker(msg, type, event) {
    return client.replyMessage(event.replyToken, {
        type : type,
        packageId: '1',
        stickerId: msg
    });
}

function replyUri(msg, type, event) {
    return client.replyMessage(event.replyToken, {
        type: 'template',
        altText: '哩低對？',
        template: {
            type: 'buttons',
            text: '哩低對？',
            actions: [{
                    type: 'uri',
                    label: '傳送我的位置',
                    uri: 'line://nv/location'
                }]
        }
    });
}

function replyImagemap(msg, type, event) {
    return client.replyMessage(event.replyToken, {
        type: 'imagemap',
        baseUrl: 'https://www.fzhd8.com/mobile/image/our-goods04.png',
        altText: 'this is an imagemap',
        baseSize: { height: 1040, width: 1040 },
        actions: [{
                type: 'uri',
                linkUri: 'https://example.com/',
                area: { x: 0, y: 0, width: 520, height: 1040 }
            }, {
                type: 'message',
                text: 'hello',
                area: { x: 520, y: 0, width: 520, height: 1040 }
            }]
    });
}

function replyCarouselTemplateFormMinkch10(event) {
    var columns = [];
    var Randurl = url + getRandomIntInclusive(1, 277);
    request(Randurl, (err, res, body) => {
        const $ = cheerio.load(body);
        $('article').each(function (i, elem) {
            columns.push({
                thumbnailImageUrl: "https:" + $(this).find('.pict').attr("src"),
                title: $(this).find(".entry-title-text").text(),
                text: $(this).find("strong").text(),
                actions: [{
                        type: 'postback',
                        label: '看全部',
                        data: $(this).find('.entry-title a').attr("href")
                    }]
            });
        })
        return client.replyMessage(event.replyToken, {
            type: 'template',
            altText: '有人攔轎啦！',
            template: {
                type: 'carousel',
                columns: columns
            }
        });
    });


}

function pushMessage(msg, type, event) {
    var source = event.source;
    //switch (type) {
    //    case "text":
    //        return client.pushMessage(source.userId, {
    //            type: type,
    //            text: 'push'
    //        });
    //        break;
    //    case "image":
    //        return client.pushMessage(source.userId, {
    //            type: type,
    //            previewImageUrl: msg,
    //            originalContentUrl : msg
    //        });
    //        break;
    //    case "video":
    //        return client.pushMessage(source.userId, {
    //            type: type,
    //            previewImageUrl: msg,
    //            originalContentUrl : msg
    //        });
    //        break;
    //}
    if (msg.indexOf("https:") < 0) msg = "https:" + msg;
    //console.log(msg);
    switch (source.type) {
        case "user":
            return client.pushMessage(source.userId, {
                type: type,
                previewImageUrl: msg,
                originalContentUrl : msg
            });
            break
        case "room":
            return client.pushMessage(source.roomId, {
                type: type,
                previewImageUrl: msg,
                originalContentUrl : msg
            });
            
            break
        case "group":
            return client.pushMessage(source.groupId, {
                type: type,
                previewImageUrl: msg,
                originalContentUrl : msg
            });
            break
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

var replyType = {
    text: 'text',
    image: 'image',
    video: 'video',
    sticker: 'sticker',
    uri: 'uri'
};
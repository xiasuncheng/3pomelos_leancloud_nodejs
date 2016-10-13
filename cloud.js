var AV = require('leanengine');

AV.Cloud.define('push_timer', function (request, response) {
    var query = new AV.Query("_Installation");

    var today = new Date();
    var weekDay = today.getDay();
    console.log('The week number is: '+ weekDay);//获取系统的星期数
    query.equalTo("deviceType", "ios");

    switch (weekDay) {
        case 1:
            AV.Push.send({
                prod: "PROD",//dev为预备环境，prod为生产环境
                where: query,
                data: {
                    "alert": "本周育儿要点：亲爱的宝妈/宝爸，根据您家宝宝的成长情况，本周我们为您精心推荐的育儿要点为您呈上，速来关注哦！",
                    "category": "0",
                    "badge": "1",
                    "sound": "",
                    "content-available": "1"
                }
            });
            break;
        case 2:
            AV.Push.send({
                prod: "PROD",
                where: query,
                data: {
                    "alert": "点击查看宝宝的发育体征：亲爱的宝妈/宝爸，以下是您宝宝本周的发育体征，关注宝宝的发育体征，让宝宝有一个健康的成长环境哦！",
                    "category": "1",
                    "badge": "1",
                    "sound": "",
                    "content-available": "1"
                }
            });
            break;
        case 3:
            AV.Push.send({
                prod: "PROD",
                where: query,
                data: {
                    "alert": "育儿科普提示：亲爱的宝妈/宝爸，根据您家宝宝的成长情况，我们为您精心推荐的科普提示为您呈上，速来关注！",
                    "category": "2",
                    "badge": "1",
                    "sound": "",
                    "content-available": "1"
                }
            });
            break;
        case 4:
            AV.Push.send({
                prod: "PROD",
                where: query,
                data: {
                    "alert": "宝宝成长关注：亲爱的宝妈/宝爸，关注您家宝宝的成长，让您家的宝宝有更好的成长环境，点击关注哦",
                    "category": "3",
                    "badge": "1",
                    "sound": "",
                    "content-available": "1"
                }
            });
            break;
        case 5:
            AV.Push.send({
                prod: "PROD",
                where: query,
                data: {
                    "alert": "与宝宝的亲子互动：亲爱的宝妈/宝爸，这里有各种和宝宝一起玩的游戏，点击打开了解哦",
                    "category": "4",
                    "badge": "1",
                    "sound": "",
                    "content-available": "1"
                }
            });
            break;
        default:
    }

    return response.success();
});

module.exports = AV.Cloud;


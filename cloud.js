var AV = require('leanengine');

//用户消息推送，每周一至周五 19:30刷新
AV.Cloud.define('push_timer', function (request, response) {
    var query = new AV.Query("_Installation");

    var today = new Date();
    var weekDay = today.getDay();
    console.log('Push timer running! Week number= ' + weekDay);//获取系统的星期数
    query.equalTo("deviceType", "ios");

    switch (weekDay) {
        case 1:
            AV.Push.send({
                prod: "prod",//dev为预备环境，prod为生产环境
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
                prod: "prod",
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
                prod: "prod",
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
                prod: "prod",
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
                prod: "prod",
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

//用户lastCaloriesValue 值的刷新，与推车刷新时间保持一致，每天23:59刷新
AV.Cloud.define('lastCaloriesValueRefreshTimer', function (request, response) {
    console.log('last Calories Value refresh timer is emmiter....');
    var query = new AV.Query('totalCalories');
    query.notEqualTo('lastCaloriesValue', 'xxx');//遍历所有的值
    query.find().then(function (results) {
        if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                var totalCaloriesValue = results[i].get('totalCaloriesValue');
                //console.log('total sum= ' + results.length + '  ' + totalCaloriesValue + '   now sum= ' + (i + 1).toString())
                // 第一个参数是 className，第二个参数是 objectId,  results[0].get('objectId')中results如果没有返回值的话会出错
                var savetodo = AV.Object.createWithoutData('totalCalories', results[i].get('objectId'));
                savetodo.set('lastCaloriesValue', totalCaloriesValue);// 修改属性
                savetodo.save();// 保存到云端
            }
        }
    });
    return response.success();
});

//用于卡路里的计算，生成一条新数据的时候计算
AV.Cloud.beforeSave('TravelInfo', function (request, response) {//calorieCalculate
    if (request.currentUser.id != undefined) {
        var averageSpeed = request.object.get('averageSpeed');//获取今日平均速度
        var todayMileage = request.object.get('todayMileage');//获取今日里程
        var weightMET = 0.0;
        var calorieValue = 0;
        console.log('beforeSave starting.... averageSpeed=' + averageSpeed + ', todayMileage=' + todayMileage + ', userid=' + request.currentUser.id);//调试信息
        //获取用户设置的体重值
        var query = new AV.Query("totalCalories");
        query.equalTo('postId', request.currentUser.id);
        query.find().then(function (results) {
            if (results.length >= 1) {
                // console.log(results.length);
                // console.log(results);//调试信息
                //console.log('totalCalories for now user exsist....');//调试信息
                var query1 = new AV.Query('totalCalories');
                query1.get(results[0].get('objectId')).then(function (todo) {
                    var adultWeight = todo.get('adultWeight');//获取成人体重
                    var lastCaloriesValue = todo.get('lastCaloriesValue');
                    //console.log('Get the adultWeight= ' + adultWeight);//调试信息
                    //计算卡路里数值
                    if (averageSpeed && todayMileage && adultWeight) {
                        if (isNaN(averageSpeed) || isNaN(todayMileage) || isNaN(adultWeight)) {
                            response.error('No number!');
                        }
                        else {
                            var speed = parseFloat(averageSpeed);
                            //console.log('compute the  Calories value....');//调试信息
                            if (speed < 7.2) {
                                if (speed < 2.5) {
                                    weightMET = 2.5;
                                } else if (speed < 3.2 && speed >= 2.5) {
                                    weightMET = 3;
                                } else if (speed < 4 && speed >= 3.2) {
                                    weightMET = 3.5;
                                } else if (speed < 4.8 && speed >= 4) {
                                    weightMET = 3.8;
                                } else if (speed < 5.6 && speed >= 4.8) {
                                    weightMET = 4.3;
                                } else if (speed < 6.5 && speed >= 5.6) {
                                    weightMET = 5.5;
                                } else {
                                    weightMET = 6.8;
                                }
                                if (speed > 0) {
                                    calorieValue = (parseFloat(todayMileage) / speed ) * parseFloat(adultWeight) * weightMET;//=体重*时间*MET
                                }
                                else {
                                    calorieValue = 0;
                                }
                            } else {
                                if (speed > 0) {
                                    var kValue = 30 / (24000 / (speed * 1000));//k=30 /速度    速度单位为：（分钟/400米）
                                    calorieValue = parseFloat(adultWeight) * (parseFloat(todayMileage) / speed ) * kValue;//=体重*时间*K
                                } else {
                                    calorieValue = 0;
                                }

                            }
                            //console.log('saving the today calorieValue....');//调试信息
                            request.object.set('calorieValue', Math.round(calorieValue).toString());
                            //console.log('saving the all calorieValue....');//调试信息
                            var newValue = (parseFloat(lastCaloriesValue) + parseFloat( Math.round(calorieValue))).toString();
                            // 第一个参数是 className，第二个参数是 objectId,  results[0].get('objectId')中results如果没有返回值的话会出错
                            var savetodo = AV.Object.createWithoutData('totalCalories', results[0].get('objectId'));
                            savetodo.set('totalCaloriesValue', newValue);// 修改属性
                            savetodo.save();// 保存到云端
                            response.success();
                        }

                    }
                    else {
                        response.error('Data null!');
                    }

                }, function (error) {
                    // 异常处理
                    console.error(error);
                });
            } else {

                //判断是否存在该ID的行，如果没有则新建一个
                //console.log('totalCalories for now user no exsist, then create one....');//调试信息
                var TotalCalories = AV.Object.extend('totalCalories');
                var totalCalories = new TotalCalories();
                totalCalories.set('totalCaloriesValue', '0');
                totalCalories.set('lastCaloriesValue', '0');
                totalCalories.set('adultWeight', '0');
                totalCalories.set('post', request.currentUser);//写入关联对象post，与user绑定
                totalCalories.set('postId', request.currentUser.id);//写入关联对象post，与user绑定
                totalCalories.save().then(function (todo) {
                    //console.log('objectId is ' + todo.id);
                }, function (error) {
                    console.error(error);
                });
                // console.log('saving the today calorieValue = 0 , because the adult weight is not setting....');//调试信息
                request.object.set('calorieValue', '0');
                response.success();
            }


        }, function (error) {
            // 异常处理
            console.error(error);
        });
    }
    else {
        //console.log('Can\'t get the userID');
        response.error();
    }
});

//用于卡路里的计算，更新数据的时候计算
AV.Cloud.beforeUpdate('TravelInfo', function (request, response) {
//console.log(request.currentUser.id);
    if (request.currentUser.id != undefined) {
        var averageSpeed = request.object.get('averageSpeed');//获取今日平均速度
        var todayMileage = request.object.get('todayMileage');//获取今日里程
        var weightMET = 0.0;
        var calorieValue = 0;
        console.log('beforeUpdate starting.... averageSpeed=' + averageSpeed + ', todayMileage=' + todayMileage + ', userid=' + request.currentUser.id);//调试信息
        //获取用户设置的体重值
        var query = new AV.Query("totalCalories");
        query.equalTo('postId', request.currentUser.id);
        query.find().then(function (results) {
            if (results.length >= 1) {
                // console.log(results.length);
                // console.log(results);//调试信息
                //console.log('totalCalories for now user exsist....');//调试信息
                var query1 = new AV.Query('totalCalories');
                query1.get(results[0].get('objectId')).then(function (todo) {
                    var adultWeight = todo.get('adultWeight');//获取成人体重
                    var lastCaloriesValue = todo.get('lastCaloriesValue');
                    //console.log('Get the adultWeight= ' + adultWeight);//调试信息
                    //计算卡路里数值
                    if (averageSpeed && todayMileage && adultWeight) {
                        if (isNaN(averageSpeed) || isNaN(todayMileage) || isNaN(adultWeight)) {
                            response.error('No number!');
                        }
                        else {
                            var speed = parseFloat(averageSpeed);
                            //console.log('compute the  Calories value....');//调试信息
                            if (speed < 7.2) {
                                if (speed < 2.5) {
                                    weightMET = 2.5;
                                } else if (speed < 3.2 && speed >= 2.5) {
                                    weightMET = 3;
                                } else if (speed < 4 && speed >= 3.2) {
                                    weightMET = 3.5;
                                } else if (speed < 4.8 && speed >= 4) {
                                    weightMET = 3.8;
                                } else if (speed < 5.6 && speed >= 4.8) {
                                    weightMET = 4.3;
                                } else if (speed < 6.5 && speed >= 5.6) {
                                    weightMET = 5.5;
                                } else {
                                    weightMET = 6.8;
                                }
                                if (speed > 0) {
                                    calorieValue = (parseFloat(todayMileage) / speed ) * parseFloat(adultWeight) * weightMET;//=体重*时间*MET
                                }
                                else {
                                    calorieValue = 0;
                                }
                            } else {
                                if (speed > 0) {
                                    var kValue = 30 / (24000 / (speed * 1000));//k=30 /速度    速度单位为：（分钟/400米）
                                    calorieValue = parseFloat(adultWeight) * (parseFloat(todayMileage) / speed ) * kValue;//=体重*时间*K
                                } else {
                                    calorieValue = 0;
                                }

                            }
                            // console.log('saving the today calorieValue....');//调试信息
                            //request.object.set('calorieValue', Math.round(calorieValue).toString());
                            var savetodo1 = AV.Object.createWithoutData('TravelInfo', request.object.get('objectId'));
                            savetodo1.set('calorieValue', Math.round(calorieValue).toString());// 修改属性
                            savetodo1.save();// 保存到云端

                            //console.log('saving the all calorieValue....');//调试信息
                            var newValue = (parseFloat(lastCaloriesValue) + parseFloat( Math.round(calorieValue))).toString();
                            // 第一个参数是 className，第二个参数是 objectId,  results[0].get('objectId')中results如果没有返回值的话会出错
                            var savetodo = AV.Object.createWithoutData('totalCalories', results[0].get('objectId'));
                            savetodo.set('totalCaloriesValue', newValue);// 修改属性
                            savetodo.save();// 保存到云端

                            response.success();
                        }

                    }
                    else {
                        response.error('Data null!');
                    }

                }, function (error) {
                    // 异常处理
                    console.error(error);
                });
            } else {

                //判断是否存在该ID的行，如果没有则新建一个
                //console.log('totalCalories for now user no exsist, then create one....');//调试信息
                var TotalCalories = AV.Object.extend('totalCalories');
                var totalCalories = new TotalCalories();
                totalCalories.set('totalCaloriesValue', '0');
                totalCalories.set('lastCaloriesValue', '0');
                totalCalories.set('adultWeight', '0');
                totalCalories.set('post', request.currentUser);//写入关联对象post，与user绑定
                totalCalories.set('postId', request.currentUser.id);//写入关联对象post，与user绑定
                totalCalories.save().then(function (todo) {
                    //console.log('objectId is ' + todo.id);
                }, function (error) {
                    console.error(error);
                });
                //console.log('saving the today calorieValue = 0 , because the adult weight is not setting....');//调试信息
                request.object.set('calorieValue', '0');
                response.success();
            }


        }, function (error) {
            // 异常处理
            console.error(error);
        });
    } else {
        //console.log('Can\'t get the userID');
        response.error();
    }
});


// AV.Cloud.afterSave('TravelInfo', function (request) {
//
//     var calorieValue = request.object.get('calorieValue');//获取今日卡路里
//     console.log('afterSave Hook function starting');//调试信息
//     var query = new AV.Query('totalCalories');
//     query.equalTo('postId', request.currentUser.id);
//     query.find().then(function (results) {
//         //console.log(results.length);
//         if (results.length >= 1) {
//             console.log('totalCalories for now user exsist....');//调试信息
//
//             var query1 = new AV.Query('totalCalories');
//             query1.get(results[0].get('objectId')).then(function (todo) {
//                 //var totalCaloriesValue = todo.get('totalCaloriesValue');
//                 var lastCaloriesValue = todo.get('lastCaloriesValue');
//                 //console.log(totalCaloriesValue);
//                 var newValue = (parseFloat(lastCaloriesValue) + parseFloat(calorieValue)).toString();
//                 console.log('save the total calories value= ' + newValue);//调试信息
//                 // 第一个参数是 className，第二个参数是 objectId,  results[0].get('objectId')中results如果没有返回值的话会出错
//                 var savetodo = AV.Object.createWithoutData('totalCalories', results[0].get('objectId'));
//                 savetodo.set('totalCaloriesValue', newValue);// 修改属性
//                 savetodo.save();// 保存到云端
//
//             }, function (error) {
//                 // 异常处理
//                 console.error(error);
//             });
//
//         } else {
//             console.log('totalCalories for now user no exsist, then create one....');//调试信息
//
//             //判断是否存在该ID的行，如果没有则新建一个
//             var TotalCalories = AV.Object.extend('totalCalories');
//             var totalCalories = new TotalCalories();
//             totalCalories.set('totalCaloriesValue', calorieValue);
//             totalCalories.set('lastCaloriesValue', '0');
//             totalCalories.set('adultWeight', '0');
//             totalCalories.set('post', request.currentUser);//写入关联对象post，与user绑定
//             totalCalories.set('postId', request.currentUser.id);//写入关联对象post，与user绑定
//             totalCalories.save().then(function (todo) {
//                 //console.log('objectId is ' + todo.id);
//             }, function (error) {
//                 console.error(error);
//             });
//         }
//
//     });
//
//
// });


module.exports = AV.Cloud;


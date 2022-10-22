/*
建议手动先点开一次
cron "1 15 * * *" jd_cxxb_help.js, tag:快速签到升级，助力跑一次即可
*/
var {window,get_log,Env}=require('./JDcxxb.log.min.js');//{window,document,navigator,screen,get_log,GetRandomNum,Env,get_log,GetRandomNum,Env}

const $ = new Env('穿行寻宝-助力');

const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

let cookiesArr = [],
    cookie = '';
let secretp = '',
    inviteId = []

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    console.log('\n仅升级，快速跑完和助力\n')
    await getUA()

    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            message = '';
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            $.newShareCodes = []
            /*await get_secretp()
            if ($.huobao == false) {
                console.log(`火爆`); continue;
            }*/
            await promote_collectAtuoScore() //定时领取
            let res
            try {
                res = await promote_getTaskDetail()
                await promote_sign()
                do {
                    var ret = await promote_raise()
                    await $.wait(1000)
                } while (ret)
            } catch (e) {
                $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
            }
        }
    }
    try {
        for (let i = 0; i < cookiesArr.length; i++) {
            if (cookiesArr[i]) {
                cookie = cookiesArr[i];
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.nickName = '';
                message = '';
                console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
                /*await get_secretp()
                if ($.huobao == false) {
                    console.log(`火爆`); continue;
                }
                await $.wait(1000)*/

                let helpRes,bizCode
                for (let j = 0; j < inviteId.length; j++) {
                    console.log(`\n开始助力 【${inviteId[j]}】`)
                    helpRes = await help(inviteId[j])
                    /*
                                            const helpCode = helpCodeArr[i]
                                            const { pin, code } = helpCode
                                            if (pin === $.UserName) continue
                                            console.log(`去帮助用户：${pin}`)
                                            const helpRes = await doApi("collectScore", null, { inviteId: code }, true, true)*/
                    if(helpRes && helpRes['data']){
                        helpRes = helpRes['data'];
                        bizCode = helpRes['bizCode'];
                        if (helpRes?.result?.score) {//bizCode === 0
                            const { alreadyAssistTimes, maxAssistTimes, maxTimes, score, times } = helpRes.result
                            const c = maxAssistTimes - alreadyAssistTimes
                            console.log(`互助成功，获得${score}金币，他还需要${maxTimes - times}人完成助力，你还有${maxAssistTimes - alreadyAssistTimes}次助力机会`)
                            if (!c) break
                            if (helpRes.data.result?.redpacket?.value) console.log('🧧', parseFloat(helpRes.data.result?.redpacket?.value))
                            //console.log('助力结果：'+helpRes.data.bizMsg)
                        }else if (bizCode==108) { //无助力
                            console.log(helpRes.data.bizMsg); break
                        }else if (bizCode==-201) {//好友人气爆棚，不需要助力啦~
                            console.log(helpRes.data.bizMsg);
                            inviteId.splice(j, 1)
                            //$.newHelpCodeArr = $.newHelpCodeArr.filter(x => x.pin !== pin)
                            j--
                            continue
                        }else if (bizCode==-1002) {//运行环境异常，请您从正规途径参与活动，谢谢~
                            break;
                        }else {
                            console.log(`互助失败，原因：${helpRes?.bizMsg}（${bizCode}）`)
                            if (![0, -201, -202].includes(bizCode)) break
                        }
                        await $.wait(1000)
                    }else{
                        //{ code: -40300, msg: '运行环境异常，请您从正规途径参与活动，谢谢~' }
                        console.log(helpRes);
                        break;
                    }
                }
            }
        }
    } catch (e) {
        $.log(`❌ ${$.name}, 失败! 原因: `, e)
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function get_secretp() {
    let body = {};
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getHomeData", body), async(err, resp, data) => {
            //console.log(data)
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        $.huobao = data.data.success
                        if (data.code == 0) {
                            if (data.data && data.data.bizCode === 0) {
                                secretp = data.data.result.homeMainInfo.secretp
                            }
                        }

                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function promote_sign() {
    let random=window.smashUtils.getRandom(8);
    let body = {"random":random,"log":get_log(random)}
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_sign", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {

                                console.log(`签到成功`)
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        } else {
                            console.log(`签到失败:${JSON.stringify(data)}\n`)
                            //签到失败:{"code":-40300,"msg":"运行环境异常，请您从正规途径参与活动，谢谢~"}
                            resolve(false)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function promote_collectAtuoScore() {
    let random=window.smashUtils.getRandom(8);
    let body = {"random":random,"log":get_log(random)}
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_collectAutoScore", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                console.log(`成功领取${data.data.result.produceScore}个币`)
                            }
                        } else {
                            //签到失败:{"code":-40300,"msg":"运行环境异常，请您从正规途径参与活动，谢谢~"}
                            console.log(`\n\nsecretp失败:${JSON.stringify(data)}\n`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function promote_getTaskDetail() {
    let body = {"appSign":"1"};
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getTaskDetail", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                let 助力码 = data.data.result.inviteId
                                if (!助力码) {
                                    console.log("黑号")
                                    resolve("")
                                }
                                console.log('助力码：',助力码)
                                inviteId.push(助力码)
                                resolve(data.data.result)
                            }
                        } else {
                            //console.log(`\n\nsecretp失败:${JSON.stringify(data)}\n`)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function help(inviteId) {
    let random=window.smashUtils.getRandom(8);
    let body = {"random":random,"log":get_log(random),"actionType":"0","inviteId":inviteId}
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_collectScore", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function promote_raise() {
    let random=window.smashUtils.getRandom(8);
    let body = {"scenceId":1,"random":random,"log":get_log(random)}
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_raise", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                console.log(`升级成功`)
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        } else {
                            console.log(`升级失败:${JSON.stringify(data)}\n`)
                            //签到失败:{"code":-40300,"msg":"运行环境异常，请您从正规途径参与活动，谢谢~"}
                            resolve(false)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function taskPostUrl(functionId, body) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}`,
        body: `functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=m&clientVersion=-1&appid=signed_wh5`,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            'referer': 'https://wbbny.m.jd.com',
            'Origin': 'https://wbbny.m.jd.com',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
}


function getUA() {
    $.UUID = randomString(40)
    $.UA = `jdapp;android;10.3.2`
}

function randomNum(min, max) {
    if (arguments.length === 0) return Math.random()
    if (!max) max = 10 ** (Math.log(min) * Math.LOG10E + 1 | 0) - 1
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomString(min, max = 0) {
    var str = "", range = min, arr = [...Array(36).keys()].map(k => k.toString(36));
    if (max) {
        range = Math.floor(Math.random() * (max - min + 1) + min);
    }
    for (let i = 0; i < range;) {
        let r = Math.random().toString(16).substring(2)
        if ((range - i) > r.length) {
            str += r
            i += r.length
        } else {
            str += r.slice(i - range)
            i += r.length
        }
    }
    return str;
}

function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
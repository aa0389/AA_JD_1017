/*
建议手动先点开一次
cron "1 8 * * *" jd_cxxb_team.js, tag:快速升级，跑一次即可
*/
var {window,get_log,Env,document}=require('./jdlog.js');//{window,document,navigator,screen,get_log,GetRandomNum,Env,get_log,GetRandomNum,Env}

const $ = new Env('穿行寻宝-膨胀');

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
const cxxbCode = process.env.JD_CXXB_CODE

let groups=[],g_i=0;
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    console.log('\n仅加战队\n')
    await getUA()


    // let 队长用户名=[],队伍数量=cookiesArr.length>0?Math.ceil(cookiesArr.length/30):0;
    // for (let i = 0; i < cookiesArr.length; i++) {
    //     if (cookiesArr[i]) {
    //         cookie = cookiesArr[i];
    //         $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    //         $.index = i + 1;
    //         $.isLogin = true;
    //         $.nickName = '';
    //         message = '';
    //         console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
    //         $.newShareCodes = []
    //         document.cookie=cookie;
    //         /* await get_secretp()
    //         if ($.huobao == false) {
    //             console.log(`火爆`); continue;
    //         }
    //         await promote_collectAtuoScore() //定时领取
    //         */
    //         let res
    //
    //         //此处修改组队人数
    //         if ( 队伍数量>groups.length ) {
    //             res = await promote_pk_getHomeData()
    //             if (res && res.data?.result?.groupInfo?.memberList) {
    //                 let memberCount = res.data.result.groupInfo.memberList.length
    //                 console.log('当前队伍有', memberCount, '人')
    //                 let groupJoinInviteId = ""
    //                 if (memberCount < 30) {
    //                     //队伍数量--;
    //                     队长用户名.push($.UserName);
    //                     groupJoinInviteId = res.data.result.groupInfo.groupJoinInviteId
    //                     res = await getEncryptedPinColor()
    //                     groups.push({ mpin: res.result, groupJoinInviteId: groupJoinInviteId,num:memberCount  })
    //                     console.log('队伍未满:', groupJoinInviteId)
    //                 }
    //             }
    //         }else break;
    //     }
    // }
    try {
        for (let i = 0; i < cookiesArr.length; i++) {
            if (cookiesArr[i]) {
                cookie = cookiesArr[i];
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.nickName = '';
                message = '';
                // if($.UserName && 队长用户名.indexOf($.UserName)!==-1) continue;
                console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
                // if(groups.length>g_i){
                    document.cookie=cookie;
                    let re = await aa_pz();
                    if(re.data.bizCode == -19){
                        break;
                    }
                    await $.wait(3000)
                // }
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



function aa_pz() {
    let random=window.smashUtils.getRandom(8);
    let log = get_log(random);
    let body = {"random":random,"log":log,"actionType":"0","inviteId":cxxbCode}
    console.log(JSON.stringify(body))
    return ;
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_pk_collectPkExpandScore", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            console.log(`成功助力吗$：\n${JSON.stringify(data)}`)
                            // data = JSON.parse(data);
                            if(data.data.bizCode == 19){

                            }
                            // if (data.data && data['data']['bizCode'] === 0) {
                            // }
                        } else {
                            //签到失败:{"code":-40300,"msg":"运行环境异常，请您从正规途径参与活动，谢谢~"}
                            console.log(`promote_pk_collectPkExpandScore:\n${JSON.stringify(data)}\n`)
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
    let log = get_log(random);
    let body = {"random":random,"log":log}
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
                            console.log(`promote_collectAutoScore失败:\n${JSON.stringify(data)}\n`)
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

function promote_pk_getHomeData(inviteId='') {
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_pk_getHomeData", inviteId?{"inviteId":inviteId}:{}), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                    } else {
                        console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function getEncryptedPinColor() {
    return new Promise((resolve) => {
        $.post(taskPostUrl2("getEncryptedPinColor", {}), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                    } else {
                        console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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


function collectFriendRecordColor(mpin) {
    return new Promise((resolve) => {
        //"assistType": "2"
        $.post(taskPostUrl("collectFriendRecordColor", {"mpin": mpin, "businessCode": "20136", "assistType": "1", "shareSource": 1}), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                    } else {
                        console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function promote_pk_joinGroup(groupJoinInviteId) {
    let random=window.smashUtils.getRandom(8);
    let log = get_log(random);
    let body = {"inviteId": groupJoinInviteId, random: random,log: log, "confirmFlag": 1};
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_pk_joinGroup", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                    } else {
                        console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            'referer': 'https://wbbny.m.jd.com',
            'Origin': 'https://wbbny.m.jd.com',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
}

function taskPostUrl2(functionId, body) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}&client=wh5`,
        body: `body=${escape(JSON.stringify(body))}`,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://wbbny.m.jd.com',
        }
    }
}

function getUA() {
    $.UUID = randomString(40)
    $.UA = `jdapp;iPhone;11.3.0;;;M/5.0;JDEbook/openapp.jdreader;appBuild/168341;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22CNS3DzO5DtdwDtVrCwUnD2PsENLwZWC3DQY4EJOnZwCyZwCmCtHvYG%3D%3D%22%2C%22sv%22%3A%22CJGkEK%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1666620806%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
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
        let randomString = Math.random().toString(16).substring(2)
        if ((range - i) > randomString.length) {
            str += randomString
            i += randomString.length
        } else {
            str += randomString.slice(i - range)
            i += randomString.length
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
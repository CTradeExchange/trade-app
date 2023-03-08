import pako from 'pako'
import dayjs from 'dayjs'
import store from '@/store/index.js'
import i18n from '@/plugins/i18n/index.js'
import { lt, gt, toFixed } from '@/utils/calculation.js'

export const pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/ // 至少8个字符，至少1个大写字母，至少1个字母，1个数字和1个特殊字符

// 获取设备信息
export function getSystemInfoSync () {
    return uni.getSystemInfoSync()
}

// 防抖函数
export function debounce (fn, delay = 500) {
    let timer = null
    return function () {
        const context = this
        const args = arguments
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(context, args)
        }, delay)
    }
}

// 节流函数
export function throttle (fn, delay = 500) {
    let activeTime = 0
    return function () {
        const context = this
        const args = arguments
        const currentTime = new Date()
        if (currentTime - activeTime > delay) {
            fn.apply(context, args)
            activeTime = currentTime
        }
    }
}

// 获取一个唯一的id
export function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    }) + '-' + Date.now()
}

// 深拷贝
export function deepClone (obj) {
    const _toString = Object.prototype.toString

    // null, undefined, non-object, function
    if (!obj || typeof obj !== 'object') {
        return obj
    }
    // DOM Node
    if (obj.nodeType && 'cloneNode' in obj) {
        return obj.cloneNode(true)
    }
    // Date
    if (_toString.call(obj) === '[object Date]') {
        return new Date(obj.getTime())
    }
    // RegExp
    if (_toString.call(obj) === '[object RegExp]') {
        const flags = []
        if (obj.global) {
            flags.push('g')
        }
        if (obj.multiline) {
            flags.push('m')
        }
        if (obj.ignoreCase) {
            flags.push('i')
        }

        return new RegExp(obj.source, flags.join(''))
    }

    const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : {}

    for (const key in obj) {
        result[key] = deepClone(obj[key])
    }

    return result
}

// Gzip解压 对应wp接口数据
export function unzip (str) {
    let strData = atob(str)
    const charData = strData.split('').map((t) => (t.charCodeAt(0)))
    const binData = new Uint8Array(charData)
    const data = pako.inflate(binData)
    strData = String.fromCharCode.apply(null, new Uint16Array(data))
    strData = decodeURIComponent(strData)
    console.warn('解压字符', JSON.parse(strData))
    return strData
}

// 获取设备类型
export function getDevice () {
    let sourceType = 1
    const systemInfo = store.state._global.systemInfo

    // #ifdef APP-PLUS
    if (systemInfo.platform === 'android') {
        sourceType = 4
    }
    if (systemInfo.platform === 'ios') {
        sourceType = 5
    }
    // #endif

    return sourceType
}

// 获取连接参数
export function getQueryVariable (variable, search = location.search) {
    if (!search) {
        return undefined
    }
    var query = search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (pair[0] == variable) { return decodeURIComponent(pair[1]) }
    }
    return undefined
}

// 获取登录参数
export function getLoginParams () {
    return JSON.parse(uni.getStorageSync('loginParams'))
}

// 删除登录参数
export function removeLoginParams () {
    uni.removeStorageSync('token')
    uni.removeStorageSync('loginParams')
}

// 获取登录token
export function getToken () {
    return uni.getStorageSync('token')
}

// 设置登录token
export function setToken (token) {
    return uni.setStorageSync('token', token)
}

// 设置缓存数据
export function localSet (key, val) {
    return uni.setStorageSync(key, val)
}

// localstorage 保存对象
export function localSetObj (objKey, key, val) {
    let localObj = localGet(objKey)
    if (!isEmpty(localObj)) {
        localObj = JSON.parse(localObj)
        localObj[key] = val
        localSet(objKey, JSON.stringify(localObj))
    } else {
        localSet(objKey, JSON.stringify({
            [key]: val
        }))
    }
}

// localStorage 根据 key 获取对象中的值
export function localGetObj (objKey, key) {
    const localObj = localGet(objKey)
    if (!isEmpty(localObj)) {
        return JSON.parse(localObj)[key]
    } else {
        return ''
    }
}

// localStorage 根据 key 删除对象的
export function localRemoveKey (objKey, key) {
    const localObj = localGet(objKey)
    if (!isEmpty(localObj)) {
        var temp = JSON.parse(localObj)
        delete temp[key]
        localSet(objKey, JSON.stringify(temp))
    }
}

// 设置缓存json字符串数据
export function localSetJSON (key, val) {
    return uni.setStorageSync(key, JSON.stringify(val))
}

// 获取缓存数据
export function localGet (key) {
    return uni.getStorageSync(key)
}

// 获取本地存储json字符串类型
export function localGetJSON (key, defaultValue = null) {
    try {
        const value = uni.getStorageSync(key)
        return JSON.parse(value) || defaultValue
    } catch (e) {
        return defaultValue
    }
}

// 删除缓存数据
export function localRemove (key) {
    return uni.removeStorageSync(key)
}

// 设置缓存数据
export function sessionSet (key, val) {
    return uni.setStorageSync(key, val)
}

// 获取缓存数据
export function sessionGet (key) {
    return uni.getStorageSync(key)
}

// 删除缓存数据
export function sessionRemove (key) {
    return uni.removeStorageSync(key)
}

// 设置cookie
export function setCookie (key, val, time) {
    return uni.setStorageSync(key, val)
}

// 读取cookie
export function getCookie (key) {
    return uni.getStorageSync(key)
}

// 格式化价格
export function priceFormat (price, digits) {
    const _price = price / Math.pow(10, digits)
    return _price.toFixed(digits)
}

/* 延迟处理 */
let awaitCount = 0
export function delayAwait (fn, reset = true) {
    if (reset) awaitCount = 0
    return new Promise((resolve, reject) => {
        const flag = fn()
        if (flag) {
            return resolve(flag)
        } else {
            return awaitCount < 100 ? reject() : resolve()
        }
    }).catch(() => {
        return new Promise(resolve => {
            awaitCount++
            setTimeout(resolve, 200)
        }).then(() => delayAwait(fn, false))
    })
}

/* 获取字符长度 */
export const getLen = (str = '') => str.replace(/\p{Unified_Ideograph}/ug, '01').length

/* 判断参数是否为空 */
export function isEmpty (obj) {
    try {
        if (obj == null || obj == undefined) {
            return true
        }
        // 判断数字是否是NaN
        if (typeof obj === 'number') {
            if (isNaN(obj)) {
                return true
            } else {
                return false
            }
        }
        // 判断参数是否是布尔、函数、日期、正则，是则返回false
        if (typeof obj === 'boolean' || typeof obj === 'function' || obj instanceof Date || obj instanceof RegExp) {
            return false
        }
        // 判断参数是否是字符串，去空，如果长度为0则返回true
        if (typeof obj === 'string') {
            if (obj.trim().length == 0) {
                return true
            } else {
                return false
            }
        }

        if (typeof obj === 'object') {
            // 判断参数是否是数组，数组为空则返回true
            if (obj instanceof Array) {
                if (obj.length == 0) {
                    return true
                } else {
                    return false
                }
            }

            // 判断参数是否是对象，判断是否是空对象，是则返回true
            if (obj instanceof Object) {
                // 判断对象属性个数
                if (Object.getOwnPropertyNames(obj).length == 0) {
                    return true
                } else {
                    return false
                }
            }
        }
    } catch (e) {
        console.log(e)
        return false
    }
}

/* 获取数组里面指定key = value的对象 */
export function getArrayObj (arr, key, value) {
    let temp = {}
    if (Array.isArray(arr)) {
        arr.forEach(item => {
            if (String(item[key]) === String(value)) {
                temp = item
            }
        })
    }
    return temp
}

/* 对象排序 */
export function objArraySort (objArr, key) {
    const result = objArr.slice(0)
    return result.sort((a, b) => a[key] - b[key])
}

/* 数组对象排序 */
export function arrayObjSort (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop]
        var val2 = obj2[prop]
        if (val1 < val2) {
            return -1
        } else if (val1 > val2) {
            return 1
        } else {
            return 0
        }
    }
}

// 处理银行卡号
export function computeBank (value) {
    return `${value.substring(0, 4)} ${'*'.repeat(value.length - 8).replace(/(.{4})/g, '$1 ')}${value.length % 4 ? ' ' : ''}${value.slice(-4)}`
}

// 倒序时间(刚刚，几分钟前，几个小时前，几天前，几周前，几个月前等)
export function beforeTime (dateTimeStamp) {
    const lang = store.state._global.currentLang
    const { information } = i18n.messages[lang]
    var minute = 1000 * 60 // 把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60
    var day = hour * 24
    var week = day * 7
    var halfamonth = day * 15
    var month = day * 30
    var year = day * 365
    var now = new Date().getTime() // 获取当前时间毫秒
    // console.log(now);
    var diffValue = now - dateTimeStamp // 时间差

    if (diffValue < 0) {
        return
    }
    var minC = diffValue / minute // 计算时间差的分，时，天，周，月
    var hourC = diffValue / hour
    var dayC = diffValue / day
    var weekC = diffValue / week
    var monthC = diffValue / month
    var yearC = diffValue / year
    var result
    if (yearC >= 1) {
        result = ' ' + parseInt(yearC) + information.yearAgo
    } else if (monthC >= 1 && monthC <= 12) {
        result = ' ' + parseInt(monthC) + information.monthAgo
    } else if (weekC >= 1 && weekC <= 4) {
        result = ' ' + parseInt(weekC) + information.weekAgo
    } else if (dayC >= 1 && dayC <= 7) {
        result = ' ' + parseInt(dayC) + information.daysAgo
    } else if (hourC >= 1 && hourC <= 24) {
        result = ' ' + parseInt(hourC) + information.hoursAgo
    } else if (minC >= 1 && minC <= 60) {
        result = ' ' + parseInt(minC) + information.minutesAgo
    } else if (diffValue >= 0 && diffValue <= minute) {
        result = information.now
    } else {
        var datetime = new Date()
        datetime.setTime(dateTimeStamp)
        var Nyear = datetime.getFullYear()
        var Nmonth =
            datetime.getMonth() + 1 < 10
                ? '0' + (datetime.getMonth() + 1)
                : datetime.getMonth() + 1
        var Ndate =
            datetime.getDate() < 10
                ? '0' + datetime.getDate()
                : datetime.getDate()
        var Nhour =
            datetime.getHours() < 10
                ? '0' + datetime.getHours()
                : datetime.getHours()
        var Nminute =
            datetime.getMinutes() < 10
                ? '0' + datetime.getMinutes()
                : datetime.getMinutes()
        var Nsecond =
            datetime.getSeconds() < 10
                ? '0' + datetime.getSeconds()
                : datetime.getSeconds()
        result = Nyear + '-' + Nmonth + '-' + Ndate
    }
    return result
}

// 处理 html 中的 time 标签
export function computeHtmlTime (content) {
    try {
        const reg = /<?time[^>]*>[^<]*<\/time>/gi
        const tag = content.match(reg)
        let returnVal
        if (!isEmpty(tag) && tag.length > 0) {
            tag.forEach(() => {
                returnVal = content.replace(reg, function (matchStr) {
                    const time = matchStr.toString().replace(/<\/?time>/g, '')
                    const timeStr = dayjs(Number(time)).format('YYYY-MM-DD HH:mm:ss')
                    return timeStr
                })
            })
            return returnVal
        } else {
            return content
        }
    } catch (error) {
        console.log(error)
    }
}

/**
 * 市价下单比较
 * @param {*} type  stopLoss 止损  profit 止盈
 * @param {*} direction  1 买入 2卖出
 * @param {*} price  价格
 * @param {*} profitStopRange 止盈止损范围的对象，包含L1,L2,L3,P1,P2,P3
 * @param {*} product 产品数据对象
 * @param {*} $t i18n多语言的方法
 * @return  {*} false 在正常范围内， 否则返回具体的错误信息
 */
export function profitLossPriceCompare (type, direction, price, profitStopRange, that) {
    const { buyStopLossRange, buyProfitRange, sellStopLossRange, sellProfitRange } = profitStopRange
    if (direction === 1) {
        if (type === 'stopLoss') {
            const [min, max] = buyStopLossRange
            if (gt(price, max)) {
                return that.$t('trade.takeLoss') + that.$t('trade.profitLossWarnTip1', ['≤' + max])
            } else if (lt(price, min)) {
                return that.$t('trade.takeLoss') + that.$t('trade.profitLossWarnTip2')
            } else {
                return false
            }
        } else if (type === 'profit') {
            const [min, max] = buyProfitRange
            if (lt(price, min)) {
                return that.$t('trade.takeProfit') + that.$t('trade.profitLossWarnTip1', ['≥' + min])
            } else if (gt(price, max)) {
                return that.$t('trade.takeProfit') + that.$t('trade.profitLossWarnTip2')
            } else {
                return false
            }
        }
    } else {
        if (type === 'stopLoss') {
            const [min, max] = sellStopLossRange
            if (lt(price, min)) {
                return that.$t('trade.takeLoss') + that.$t('trade.profitLossWarnTip1', ['≥' + min])
            } else if (gt(price, max)) {
                return that.$t('trade.takeLoss') + that.$t('trade.profitLossWarnTip2')
            } else {
                return false
            }
        } else if (type === 'profit') {
            const [min, max] = sellProfitRange
            if (gt(price, max)) {
                return that.$t('trade.takeProfit') + that.$t('trade.profitLossWarnTip1', ['≤' + max])
            } else if (lt(price, min)) {
                return that.$t('trade.takeProfit') + that.$t('trade.profitLossWarnTip2')
            } else {
                return false
            }
        }
    }
}

export function loadScript (url) {
    var scriptElement = document.createElement('script')
    document.body.appendChild(scriptElement)
    var promise = new Promise((resolve, reject) => {
        scriptElement.addEventListener(
            'load',
            e => {
                document.body.removeChild(scriptElement)
                resolve(e)
            },
            false
        )

        scriptElement.addEventListener(
            'error',
            e => {
                document.body.removeChild(scriptElement)
                reject(e)
            },
            false
        )
    })
    scriptElement.type = 'text/javascript'
    scriptElement.async = false
    scriptElement.defer = true
    scriptElement.src = url
    return promise
}

// 当前是否Tg环境
export function isTelegramEnv () {
    return !!((typeof window !== 'undefined' && window.TelegramWebviewProxy))
}

export const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


const util = {
    debounce,
    throttle,
    guid,
    deepClone,
    getDevice,
    isEmpty,
    beforeTime,
    computeHtmlTime,
    computeBank
}

export default util

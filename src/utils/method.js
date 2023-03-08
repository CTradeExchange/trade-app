import store from '@/store/index.js'
import { localRemove, localGet, localGetObj, localSetObj, setToken, localSet, localGetJSON } from '@/utils/util.js'
import i18n from '@/plugins/i18n'
import { switchUserAccount } from '@/api/user'
import vue from '../main'
import { disconnectWebsocket } from '@/plugins/socket/socket'

const apiConfig = require('@/apiConfig.js')

// 跳转到指定页面
export function goView (url) {
    uni.navigateTo({ url })
}

// 普通页面跳转
export function goPage (url, isAuth = true) {
    const customerInfo = store.state._user.customerInfo
    if (isAuth && !customerInfo) {
        // 跳转到登录页面
        const pages = getCurrentPages()
        const route = pages[pages.length - 1]?.route ?? ''
        let url = '/pages/mine/login'
        if (route) {
            url += ('?' + encodeURIComponent('/' + route))
        }
        uni.navigateTo({
            url
        })
    } else {
        // 跳转到指定页面
        uni.navigateTo({ url })
    }
}

// 跳转到webView页面
export function goWebView (url, title = '') {
    store.commit('_global/setWebView', { url, title })
    uni.navigateTo({
        url: '/pages/webview/index'
    })
}

// 跳转到图表页面
export function goChartPage (item) {
    const url = `/pages/webview/product?symbolId=${item.symbolId}&symbolName=${item.symbolName}&priceDigits=${item.symbolDigits}&symbolCode=${item.symbolCode}&tradeType=${item.tradeType}`
    uni.navigateTo({
        url
    })
}

// 跳转到资金记录页面
export function goAssetsRecord (tradeType) {
    const url = `/pages/assets/record?tradeType=${tradeType}` 
    uni.navigateTo({
        url
    })
}

// 跳转到划转页面
export function goTransfer (data) {
    const url = `/pages/assets/transfer?accountId=${data.accountId}&tradeType=${data.tradeType}`
    uni.navigateTo({
        url
    })
}

// 跳转到还款页面
export function goRepayment (data) {
    const url = `/pages/assets/repayment?accountId=${data.accountId}&currency=${data.currency}&tradeType=${data.tradeType}`
    uni.navigateTo({
	    url
    })
}

// 跳转到充值页面
export function goDeposit (data = 5) {
    let url = '/pages/deposit/choose'
    if (Object.prototype.toString.call(data) === '[object Object]') {
        if (data.currency) {
            url += `?accountId=${data.accountId}&currency=${data.currency}&tradeType=${data.tradeType}`
        } else {
            url += `?tradeType=${data.tradeType}`
        }
    } else {
        // 当前玩法不存在跳转第一个玩法
        const plans = store.state._base.plans
        const item = plans.find(el => el.tradeType === data)
        if (!item) data = Number(plans[0].tradeType)
        url += `?tradeType=${data}`
    }
    uni.navigateTo({
        url
    })
}

// 跳转到提现页面
export function goWithdraw (data) {
    const url = `/pages/withdraw/choose?accountId=${data.accountId}&currency=${data.currency}&tradeType=${data.tradeType}`
    uni.navigateTo({
	    url
    })
}

// 跳转到交易页面
export function goTrade (currency) {
    return new Promise((resolve, reject) => {
        const productList = store.state._quote.productList
        let product = productList.find(el => el.baseCurrency === currency && el.profitCurrency === 'USDT' && el.tradeType === 5)
        if (!product) {
            product = productList.find(el => el.baseCurrency === currency && el.tradeType === 5)
        }
        if (!product || product.baseCurrency === product.profitCurrency) {
            this.$toast(this.$t('fundInfo.noTradeMarket'))
            reject()
        } else {
            store.commit('_global/setOrderParams', {
                tradeType: product.tradeType,
                symbolId: product.symbolId,
                direction: 'buy'
            })
            uni.switchTab({
                url: '/pages/order/index'
            })
            resolve()
        }
    })
}

// 跳转到基金V10页面
export function goV10Page () {
    const { apiBase } = apiConfig
    const customerGroupId = store.getters.customerGroupId
    const lang = localGet('lang')
    const url = `${apiBase}/${lang}/fundV10/index?isUniapp=true&customerGroupId=${customerGroupId}`
    store.commit('_global/setWebView', { url, title: 'V10' })
    uni.navigateTo({
	    url: '/pages/webview/v10'
    })
}

// 产品排序
const currencys = ['V10', 'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'LUNA', 'DOT', 'AVAX', 'DOGE', 'MATIC', 'SHIB', 'LINK', 'NEAR', 'UNI', 'ALGO', 'LTC', 'ATOM', 'ICP', 'BCH', 'TRX', 'XLM', 'FTM', 'FTT', 'MANA', 'HBAR', 'VET', 'AXS', 'FIL', 'SAND']
export function productSort (data) {
    let result = []
    currencys.map(currency => {
        data.map(elem => {
            if (elem.baseCurrency === currency) {
                result.push(elem)
                data = data.filter(el => el.symbolId !== elem.symbolId)
            }
        })
    })
    result = result.concat(data)
    return result
}

// 获取玩法默认产品
export function getDefaultProduct (tradeType) {
    // 有效的品种
    const availableList = store.getters['_quote/userProductCategoryKeys'] || []

    let product = null

    // 优先进入上一次访问的产品
    const lastProductSymbolKey = (localGetJSON('productHistory', {})[tradeType]) || ''
    if (lastProductSymbolKey && availableList.includes(lastProductSymbolKey)) {
        const lastProduct = store.state._quote.productMap[lastProductSymbolKey]
        if (lastProduct?.symbolName && lastProduct?.symbolId) {
            return lastProduct
        }
    }
    const arr = store.state._quote.productList.filter(el => {
        return Number(el.tradeType) === tradeType && availableList.includes(el.symbolKey)
    }).sort((a, b) => {
        return a.sortNum - b.sortNum
    })

    const symbolKyes = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USDT']
    // XAUUSD 通过symbolCode匹配， 其他产品基础货币+盈亏货币匹配
    product = arr.find(el => el.symbolCode === 'XAUUSD')
    if (product) return product

    for (let i = 0; i < symbolKyes.length; i++) {
        if (product) break
        for (let j = 0; j < arr.length; j++) {
            const el = arr[j]
            const key = el.baseCurrency + '/' + el.profitCurrency
            if (symbolKyes[i] === key) {
                product = el
                break
            }
        }
    }
    if (!product && arr.length > 0) product = arr[0]
    return product
}

// 获取app嵌套h5页面url参数
export function getUrlParam () {
    const global = store.state._global
    const timestamp = Date.now()
    const accountType = localGetObj('mockAccount', 'lastAccountType') || 'real'
    const demoDomain = localGetObj('mockAccount', 'demo_domain')
    const result = `customerGroupId=${store.getters.customerGroupId}&lang=${global.currentLang}&theme=${global.currentTheme}&chartColorType=${global.changeColorType}&isUniapp=true&demoDomain=${demoDomain}&accountType=${accountType}&timestamp=${timestamp}`
    return result
}

// 跳转到客服页面
export function toService (title) {
    const { onlineService } = store.state._base.wpCompanyInfo
    // 处理传event对象的问题
    if (typeof title !== 'string') {
        title = i18n.t('common.serivce')
    }
    if (onlineService) {
        goWebView(onlineService, title)
    }
}

// 跳转登录页
export function toLogin () {
    const pages = getCurrentPages()
    const route = pages[pages.length - 1]?.route || ''
    let url = 'pages/mine/login'
    if (route !== url) {
        if (route) {
            url += (`${route.indexOf('?') === -1 ? '?' : '&'}referrer=${encodeURIComponent('/' + route)}`)
        }
        uni.navigateTo({
            url: '/' + url
        })
    }
}

// 封装跳转方法
const urls = [
    '/pages/home/index',
    '/pages/quote/index',
    '/pages/order/index',
    '/pages/assets/index',
    '/pages/mine/index',
]
export function jump (options) {
    const { url, replace = false } = options
    const trueUrl = url.split('?')
    if (urls.includes(trueUrl[0])) {
        uni.switchTab(options)
    } else {
        if (replace) {
            uni.redirectTo(options)
        } else {
            uni.navigateTo(options)
        }
    }
}

// 切换真实模拟账户
export function handleSwitchAccount (type) {
    return new Promise((resolve, reject) => {
        // 发起api请求
        store.commit('_global/setSwitchAccounting', true)
        disconnectWebsocket()
        switchUserAccount().then(async res => {
            // 缓存模拟公司数据
            setToken(res.data.token)
            localSet('companyId', res.data.associationCompanyId)
            localSetObj('mockAccount', 'lastAccountType', type)
            
            store.commit('_base/UPDATE_inited', false)
            await vue.$init()

            await store.dispatch('_user/findCustomerInfo')
            store.commit('_global/setSwitchAccounting', false)
            resolve(true)
        }).catch(err => {
            // 切换失败
            if (err.msg) {
                uni.showToast({
                    title: err.msg,
                    icon: 'none'
                })
                localRemove('mockAccount')
            }
            store.commit('_global/setSwitchAccounting', false)
            reject(false)
        })
    })
}

const method = {
    goView,
    goPage,
    goWebView,
    goChartPage,
    goAssetsRecord,
    goTransfer,
    goRepayment,
    goDeposit,
    goWithdraw,
    goTrade,
    goV10Page,
    getUrlParam,
    getDefaultProduct,
    toService
}

export default method

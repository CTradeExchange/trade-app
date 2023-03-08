import store from '@/store'
import i18n from '@/plugins/i18n'
import util, { isEmpty, localGet, localSet } from '@/utils/util'
import check from '@/utils/check'
import method from '@/utils/method'
import mixin from '@/mixin'
import { disconnectWebsocket, QuoteWsInit, MsgWsInit } from '@/plugins/socket/socket'
import { uniPushInit } from '@/plugins/uniPush'
import BigNumber from 'bignumber.js'
import dayjs from '@/plugins/dayjs'
const apiConfig = require('@/apiConfig')

export default {
    async install (Vue) {
        // 设置wp配置
        apiConfig.setWpConfig()
		
        // 设置默认主题色
        if (isEmpty(localGet('invertColor'))) localSet('invertColor', 'night')
        store.commit('_global/setTheme', localGet('invertColor'))
		
        // 设置默认语言
        if (isEmpty(localGet('lang'))) localSet('lang', 'en-US')
        store.commit('_global/setLang', localGet('lang'))
		
        // BigNumber
        BigNumber.config({ EXPONENTIAL_AT: [-16, 26] })
		
        // 定义全局属性或方法
        Vue.prototype.$dayjs = dayjs
        Vue.prototype.$util = util
        Vue.prototype.$check = check
        Vue.prototype.$method = method
		
        // 提示
        Vue.prototype.$toast = (title = '') => {
            uni.showToast({
                title,
                icon: 'none'
            })
        }
		
        // 是否包含CFD合约全仓、CFD合约逐仓玩法
        Vue.prototype.$includePlay_1 = (tradeType) => {
		    return [1, 2].includes(Number(tradeType))
        }
		
        // 是否包含ABCC、钱包、杠杆全仓玩法
        Vue.prototype.$includePlay_2 = (tradeType) => {
		    return [3, 5, 9].includes(Number(tradeType))
        }
		
        // 数据初始化 isAgain:是否再次请求用户数据和产品列表数据
        Vue.prototype.$init = async () => {
		    const token = localGet('token')
		    const inited = store.state._base.inited
		    const customerInfo = store.state._user.customerInfo
		    if (!inited) {
                // 清空数据
                store.commit('Update_countryList', [])
                // 断开websocket
                disconnectWebsocket()
				
		        // 获取公司配置
		        await store.dispatch('_base/initBaseConfig')
                const wpCompanyInfo = store.state._base.wpCompanyInfo
				
                // 获取cats2系统维护配置
                store.dispatch('_global/getConfigSystem')
                // 获取国家地区列表数据
                store.dispatch('getCountryListByParentCode')
                // 设置玩法别名
                setTradeTypeAlias(wpCompanyInfo)
                // 行情服务初始化
                QuoteWsInit({ $store: store })
                // 消息服务初始化
                MsgWsInit({ $store: store })
                // uniPush初始化
                uniPushInit()
                // 获取当前国家IP，是否可以访问注册登录页
                store.dispatch('_global/checkGeoipCountry')
		    }
		    if (token) {
		        // 获取用户信息
		        if (!customerInfo) {
		            await store.dispatch('_user/findCustomerInfo')
                    await store.dispatch('_quote/querySymbolBaseInfoList', null)
		        }
		    } else {
		        // 获取产品基础信息列表
		        await store.dispatch('_quote/querySymbolBaseInfoList', null)
		    }
            // 获取活动相关
            store.dispatch('_activity/getEnableAct')
            store.dispatch('_activity/getActFinishStatus')
        }
		   
        // 全局混入
        Vue.mixin(mixin)
    }
}

// 设置玩法别名
export function setTradeTypeAlias (wpCompanyInfo) {
    const { tradeTypesConfig } = wpCompanyInfo
    Object.keys(tradeTypesConfig).map(key => {
        const messages = i18n.messages[key]
        Object.keys(tradeTypesConfig[key]).map(tradeType => {
            const value = tradeTypesConfig[key][tradeType]
            if (!isEmpty(value)) {
                messages['tradeType'][tradeType] = value
            }
        })
        i18n.setLocaleMessage(key, messages)
    })
}

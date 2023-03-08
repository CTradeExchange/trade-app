import Vue from 'vue'
import Vuex from 'vuex'
import Base from '@/store/modules/base.js'
import User from '@/store/modules/user.js'
import Quote from '@/store/modules/quote.js'
import Trade from '@/store/modules/trade.js'
import Global from '@/store/global.js'
import Activity from '@/store/modules/activity.js'
import { getListByParentCode, getCountryListByParentCode } from '@/api/base.js'
import Colors from '@/colorVariables.js'
import { localGet, localSet } from '@/utils/util.js'
import CheckAPI from '@/utils/checkAPI.js'

const style = () => {
    return { ...Colors } 
}
const supportLanguages = [
    { val: 'zh-CN', name: '中文' },
    { val: 'en-US', name: 'English' },
]

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        _base: Base,
        _user: User,
        _quote: Quote,
        _trade: Trade,
        _global: Global,
        _activity: Activity
    },
    state: {
        style,
        disabledSuccAnimtion: false,
        invertColor: localGet('invertColor') || 'light', // 黑夜模式
        zoneList: [],
        bankDict: [],
        supportLanguages: supportLanguages,
        countryList: [],
        cacheViews: ['Layout'],
        currencyList: [],
        defaultCountry: {} // 默认选择的国家地区
    },
    getters: {
        // 当前选择的产品
        productActived (state) {
            return state._quote.productMap[state._quote.productActivedID]
        },
        // 用户组ID
        customerGroupId (state) { 
            return state._user.customerInfo?.customerGroupId ?? state._base.wpCompanyInfo?.customerGroupId
        },
        // 用户自选列表
        userSelfSymbolList (state, getters) {
            if (state._user.customerInfo?.optional === 1) {
                // return state._user.selfSymbolList
                const selfSymbolList = state._user.selfSymbolList
                const result = {}
                Object.keys(selfSymbolList).forEach(el => {
                    result[el] = selfSymbolList[el].map(item => item.symbolId)
                })
                return result
            } else {
                const wpSelfSymbol = state._base.wpSelfSymbol 
                const selfSymbolData = wpSelfSymbol.find(el => el.tag === 'selfSymbol')?.data?.product || {}
                const customerGroupId = getters.customerGroupId
                const newSelfSymbolData = {}
                Object.keys(selfSymbolData).forEach(el => {
                    newSelfSymbolData[el] = selfSymbolData[el][customerGroupId] ?? []
                })
                return newSelfSymbolData
            }
        },
        // 用户产品板块
        userProductCategory (state, getters) {
            const customerGroupId = getters.customerGroupId
            const wpProductCategory = state._base.wpProductCategory
            const quoteListConfig = wpProductCategory.find(el => el.tag === 'quoteList')
            if (!quoteListConfig) return {}
            const categories = quoteListConfig.data.tradeTypeBlock || {}
            Object.keys(categories).forEach(tradeType => {
                categories[tradeType].forEach(el => {
                    el.listByUser = el.list[customerGroupId] ?? []
                })
            })
            return categories
        },
        // 是否显示全仓玩法真实模拟净值
        showFullNetAsset (state) {
            const plans = state._base.plans
            const item = plans.find(el => Number(el.tradeType) === 1)
            if (plans.length === 1 && item) {
                return true
            } else {
                return false
            }
        }
    },
    mutations: {
        Update_style (state, data) {
            state.style = data
        },
        Update_quoteMode (state, data = 1) {
            state.quoteMode = data
        },
        Update_zoneList (state, list) {
            state.zoneList = list
        },
        Update_bankList (state, list) {
            state.bankDict = list
        },
        Update_countryList (state, list) {
            state.countryList = list
        },
        Update_invertColor (state, data) {
            state.invertColor = data
            localSet('invertColor', data)
        },
        add_cacheViews (state, routeName) {
            if (!routeName) return false
            if (state.cacheViews.indexOf('Layout') === -1) state.cacheViews.push('Layout')
            if (state.cacheViews.includes(routeName)) return false
            state.cacheViews.push(routeName)
        },
        del_cacheViews (state, routeName) {
            if (!routeName) return false
            const _index = state.cacheViews.findIndex(el => el === routeName)
            if (_index > -1) {
                state.cacheViews.splice(_index, 1)
            }
        },
        Update_disabledSuccAnimtion (state, data) {
            state.disabledSuccAnimtion = data
        },
        Update_currencyList (state, data) {
            state.currencyList = data
        },
        Update_supportLanguages (state, data) {
            state.supportLanguages = data
        },
        Update_defaultCountry (state) {
            const allCountryList = state.countryList
            const language = Global.state.systemInfo.language
            let index = -1
            // 根据语言优先显示默认区号
            if (language) {
			    const langCode = language.substring(language.lastIndexOf('-') + 1, language.length)
			    index = allCountryList.findIndex(el => el.nationalCode === langCode)
            }
            const defaultZone = Base.state.defaultZone // 设置默认选中项
            if (index === -1 && defaultZone?.code) {
			    index = allCountryList.findIndex(el => el.code === defaultZone.code)
            }
            const stateAreaItem = (index === -1) ? allCountryList[0] : allCountryList[index]
            state.defaultCountry = {
			    code: stateAreaItem.countryCode,
			    countryCode: stateAreaItem.code,
			    countryName: stateAreaItem.displayName,
			    name: stateAreaItem.formatName
            }
        }
    },
    actions: {
        // 获取国家验区号
        getListByParentCode ({ dispatch, commit, state }) {
            return getListByParentCode({ parentCode: 'phone_code' }).then(res => {
                if (res.check()) {
                    commit('Update_zoneList', res.data)
                }
                return res
            })
        },
        getBankDictList ({ dispatch, commit, state }) {
            return getListByParentCode({ parentCode: 'bank_code' }).then(res => {
                if (res.check()) {
                    commit('Update_bankList', res.data)
                }
                return res
            })
        },
        // 获取国家地区列表数据
        getCountryListByParentCode ({ dispatch, commit, state }, params = {}) {
            // 默认读缓存的国家列表
            const { force = false } = params
            if (force === false && state.countryList.length > 0) {
                return Promise.resolve(new CheckAPI({
                    data: state.countryList,
                    code: '0'
                }))
            }
            return getCountryListByParentCode({ parentCode: '-1' }).then(res => {
                if (res.check()) {
                    const registrable = (state._base.wpCompanyInfo?.registrable || []).map((item) => item.code)
                    const countryList = []
                    res.data.forEach((item) => {
                        // 只展示能注册的国家区号，过滤countryCode不存在的代号
                        if (item.countryCode && (registrable.length === 0 || (registrable.length && registrable.includes(item.code)))) {
                            countryList.push({
                                ...item,
                                formatName: item.displayName + ' (' + item.countryCode + ')',
                            })
                        }
                    })
                    // 排序
                    countryList.sort((a, b) => {
                        return a['formatName'].localeCompare(b['formatName'])
                    })
                    res.data = countryList
                    commit('Update_countryList', countryList)
                    commit('Update_defaultCountry')
                }
                return res
            })
        },
        getCurrencyList ({ dispatch, commit, state }, params) {
            return getListByParentCode(
                { parentCode: params || 'digit_wallet_withdraw_currency' }).then(res => {
                if (res.check()) {
                    if (params) {
                        state.currencyList.map(item => {
                            if (item.name === params) {
                                item.subList = res.data
                            }
                        })
                        return
                    }
                    commit('Update_currencyList', res.data)
                }
                return res
            })
        }
    }
})

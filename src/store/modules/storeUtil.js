// 根据玩法板块创建产品列表
export function createListByPlans (plans) {
    const planMap = {}
    const symbolList = []
    plans.forEach(symbolKey => {
        const [symbolId, tradeType] = symbolKey.split('_')
        symbolList.push({ symbolId, tradeType, symbolKey })
        if (!planMap[tradeType]) planMap[tradeType] = []
        planMap[tradeType].push(symbolId)
    })
    Object.keys(planMap).forEach(tradeType => {
        planMap[tradeType] = [...new Set(planMap[tradeType])]
    })
    return {
        symbolList,
        planMap,
    }
}

// 玩法map数据转换成list数组
export function planMapToArray (params) {
    const result = Object.keys(params).map(tradeType => {
        const symbolList = params[tradeType].symbolList || params[tradeType]
        return {
            symbolIds: symbolList.join(),
            tradeType
        }
    })
    return result
}

// 缓存本次挂单列表、持仓列表的请求参数
export function cachePendingParams (params, cacheConfig) {
    const { tradeType } = params
    const curType = cacheConfig[tradeType]
    if (curType) {
        Object.assign(curType, params)
    } else {
        cacheConfig[tradeType] = params
    }
}
// 玩法列表排序和别名
export function formatPlans (plans) {
    plans.forEach(item => {
        if (item.alias) item.name = item.alias
    })
    plans.sort((a, b) => a.sort - b.sort > 0)
    return plans
}

/* 将当前用户的玩法资产和wp配置的玩法资产对比，找出wp多出的玩法资产
 * @param {Object} customerInfo 登录接口返回的data信息
 * @param {Array} registList wp配置的registList客户组列表以及玩法
*/
export function compareAssets (customerInfo = {}, registList) {
    const { accountList = [], customerGroupId } = customerInfo

    // 用户信息的资产根据玩法tradeType将资产分类
    const userPlans = {}
    accountList.forEach(el => {
        const { currency, tradeType } = el
        if (userPlans[tradeType]) {
            userPlans[tradeType].push(currency)
        } else {
            userPlans[tradeType] = [currency]
        }
    })
    Object.keys(userPlans).forEach(el => {
        userPlans[el] = userPlans[el].sort((a, b) => a && a.localeCompare(b)).join()
    })

    // wp配置的玩法资产
    const defaultGroupConfig = registList.find(el => el.registCountry.isOther)
    const customerGroupConfig = registList.find(el => parseInt(el.customerGroupId) === customerGroupId) || defaultGroupConfig
    const customerGroupConfigPlans = customerGroupConfig.plans.filter(el => [1, 2].indexOf(el.tradeType) === -1).map(el => {
        const { allCurrency, tradeType } = el
        const currencyArray = Array.isArray(allCurrency) ? allCurrency : allCurrency.split(',')
        const allCurrencySort = currencyArray.sort((a, b) => a.localeCompare(b)).join()
        return {
            allCurrency: allCurrencySort,
            tradeType: String(tradeType)
        }
    })

    // 将wp配置的资产和用户信息的资产对比
    let different = false
    if (Object.keys(userPlans).length > customerGroupConfigPlans.length) {
        different = true
    } else {
        customerGroupConfigPlans.forEach(el => {
            const { allCurrency, tradeType } = el // 客户组配置的资产
            const userCurrency = userPlans[tradeType] // 用户资产
            if (!userPlans[tradeType]) {
                return (different = true)
            } else if (!assetsIncludes(userCurrency, allCurrency)) {
                return (different = true)
            }
        })
    }
    return different ? customerGroupConfigPlans : null
}
// 判断a组资产是否包含b组资产的所有成员
function assetsIncludes (a, b) {
    a = a.split(',')
    b = b.split(',')
    return b.every(cur => a.includes(cur))
}

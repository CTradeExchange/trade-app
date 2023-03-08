/* 
 *	wp配置
 *  isRewrite: 是否重写代理
 *  isSwitch: 是否可动态切换
 */
const wpList = [
    // 测试uat1公司
    {
        url: 'https://uatwph5-5.cmfbl.com',
        activityApi: 'https://uatcatsapi.cats-trade.com',
        value: 'uat-1',
        isRewrite: true,
        isSwitch: true
    },
    // 测试uat21公司
    {
        url: 'https://uatwph5-12.cmfbl.com',
        value: 'uat-21',
        isRewrite: true,
        isSwitch: true
    },
    // 测试uat46公司
    {
	    url: 'https://uatwph5-9.cmfbl.com',
	    value: 'uat-46',
	    isRewrite: true,
	    isSwitch: true
    },
    // 测试uat47公司
    {
	    url: 'https://uatwph5-11.cmfbl.com',
	    value: 'uat-47',
	    isRewrite: true,
	    isSwitch: true
    },
    // 测试pre360公司
    { 
        url: 'https://preh5-10.cmfbl.com',
        value: 'pre-360',
        isRewrite: true,
        isSwitch: true
    },
    // 测试pre362公司
    { 
        url: 'https://prewph5-6.cmfbl.com',
        value: 'pre-362',
        isRewrite: true,
        isSwitch: true
    },
    // 测试pre368公司
    { 
	    url: 'https://h5.aatest.online',
	    value: 'pre-368',
	    isRewrite: true,
	    isSwitch: true
    },
    // 测试pre389公司
    { 
	    url: 'https://prewph5-4.cmfbl.com',
	    value: 'pre-389',
	    isRewrite: true,
	    isSwitch: true
    },
    // 测试pre435公司
    { 
	    url: 'https://prewph5-1.cmfbl.com',
	    value: 'pre-435',
	    isRewrite: true,
	    isSwitch: true
    },
    // 测试qa公司
    {
        url: 'https://preh5-4.cmfbl.com',
        value: 'qa',
        isRewrite: true,
        isSwitch: true
    },
    // vitatoken prd
    {
        url: 'https://www.vitatoken.io/config',
        domain: 'https://www.vitatoken.io',
        value: 'vitatoken-config',
        isRewrite: true,
        isSwitch: true
    },
    // free2trader
    {
	    url: 'https://h5.free2trader.com',
	    value: 'free2trader',
	    isRewrite: true,
	    isSwitch: true
    },
    // 421
    {
        url: 'https://preh5-real.mc900.com',
        value: '421',
	    isRewrite: true,
	    isSwitch: true
    },
    // 47
    {
        url: ' https://uatwph5-11.cmfbl.com',
        value: '47',
	    isRewrite: true,
	    isSwitch: true
       
    },
    // 439
    {
        url: 'https://prewph5-3.cmfbl.com',
        activityApi: 'https://prewph5-3.cmfbl.com',
        value: '439',
	    isRewrite: true,
	    isSwitch: true
    },
    // PIDC-463
    {
        url: 'https://pre-m.pidcex.com',
        value: '463',
	    isRewrite: true,
	    isSwitch: true
    },
]

// 设置wp配置
const setWpConfig = () => {
    const defaultEnv = '463'
    const wpEnv = uni.getStorageSync('wpEnv') || defaultEnv
    const wpConfig = (wpList.find(el => (el.value === wpEnv)))
    // 当前环境
    apiConfig.wpEnv = wpConfig.value
    // 请求地址
    apiConfig.wpUrl = wpConfig.url
    if (wpConfig.activityApi) apiConfig.activityApi = wpConfig.activityApi
    // H5地址
    apiConfig.apiBase = wpConfig.domain || wpConfig.url
}

// 更新wp配置
const updateWpConfig = (item) => {
    apiConfig.wpEnv = item.value
    apiConfig.wpUrl = item.url
    if (item.activityApi) apiConfig.activityApi = item.activityApi
    apiConfig.apiBase = item.domain || item.url
    uni.setStorageSync('wpEnv', item.value)
}

// 导出的数据
const apiConfig = {
    wpEnv: '',
    wpUrl: '',
    apiBase: '',
    wpList,
    activityApi: '',
    setWpConfig,
    updateWpConfig,
    cdnUrl: 'https://cats2.oss-cn-hongkong.aliyuncs.com'
}

module.exports = apiConfig

import { localGet, localSet } from '@/utils/util.js'
import { setRootVariable } from '@/colorVariables.js'
import app from '@/app.json'
import i18n from '@/plugins/i18n'
import { geoipCountry } from '@/api/base'
const apiConfig = require('@/apiConfig.js')

export default {
    namespaced: true,
    state: {
        // app信息
        appInfo: {},
        // 系统信息
        systemInfo: {},
        // 当前主题
        currentTheme: localGet('invertColor'),
        // 当前语言
        currentLang: localGet('lang'),
        // 当前主题颜色变量集合
        style: {},
        // 涨跌显示方式 1:蓝涨红跌 2:红涨蓝跌
        changeColorType: localGet('changeColorType') || 1,
        // webview页面url地址
        webUrl: '',
        // webview页面标题
        webTitle: '',
        // 下单页面参数
        orderParams: null,
        // app配置数据
        config: {},
        // app当前手机系统配置数据
        appConfig: {},
        // 去中心化基金是否开启测试模式
        isTestMode: localGet('isTestMode') || false,
        // 是否显示切换账户环境下拉菜单
        isAccountEnv: false,
        // 首页是否需要重新加载
        homeLoad: false,
        // 行情页面是否需要加载
        quoteLoad: false,
        // 交易页面是否需要重新加载
        tradeLoad: false,
        // 资产页面是否需要重新加载
        assetsLoad: false,
        // 我的页面是否需要重新加载
        mineLoad: false,
        // 是否在真实模拟切换中
        switchAccounting: false,
        accessFlag: true, // 是否禁止访问
    },
    mutations: {	
        // 设置所有主页面需要重新加载
        setAllPageLoad (state) {
            state.homeLoad = true
            state.quoteLoad = true
            state.tradeLoad = true
            state.assetsLoad = true
            state.mineLoad = true
        },
		
        // 设置某个主页面的加载状态
        setPageLoad (state, [name, boole]) {
            if (state[name] !== 'undefined') {
                state[name] = boole
            }
        },
		
        // 设置当前语言
        setLang (state, data) {
            state.currentLang = data
            i18n.locale = data
            localSet('lang', data)
            // 设置tabBar语言
            this.commit('_global/setTabBarLang')
        },
		
        // 设置tabBar语言
        setTabBarLang () {
            const locale = i18n.locale
            let tabBar = i18n['messages'][locale]?.tabBar
            tabBar = tabBar || i18n['messages']['en-US']?.tabBar
            const arr = [
                { index: 0, value: tabBar.home },
                { index: 1, value: tabBar.quote },
                { index: 2, value: tabBar.trade },
                { index: 3, value: tabBar.assets },
                { index: 4, value: tabBar.mine }
            ]
            setTimeout(() => {
                arr.map(el => {
                    uni.setTabBarItem({
                        index: el.index,
                        text: el.value
                    })
                })
            }, 10)
        },
		
        // 设置当前主题 
        setTheme (state, data) {
            state.currentTheme = data
            state.style = setRootVariable(data)
            this.commit('_global/setNavigationBarColor')
            this.commit('_global/setTabBarStyleColor')
            // #ifdef APP-PLUS
            plus.nativeUI.setUIStyle(data)
            // #endif
        },
		
        // 设置涨跌颜色
        setChangeColorType (state, data) {
            state.changeColorType = data
            localSet('changeColorType', data)
        },
		
        // 设置状态栏颜色
        setNavigationBarColor (state) {
            setTimeout(() => {
                uni.setNavigationBarColor({
                    frontColor: state.currentTheme === 'light' ? '#000000' : '#ffffff',
                    backgroundColor: state.currentTheme === 'light' ? '#ffffff' : '#000000',
                    success: e => {
                        console.log('设置状态栏颜色成功', e)
                    },
                    fail: e => {
                        console.log('设置状态栏颜色失败', e) 
                    }
                })
            }, 100)
        },
		
        // 设置底部导航栏颜色
        setTabBarStyleColor (state) {
            const times = 0
            setTimeout(() => {
                uni.setTabBarStyle({
                    color: state.style.minorColor,
                    selectedColor: state.style.primary,
                    backgroundColor: state.style.contentColor,
                    borderStyle: state.currentTheme === 'light' ? 'black' : 'white'
                })
            }, times)
        },
		
        //  设置webview数据
        setWebView (state, data = {}) {
            state.webUrl = data.url
            state.webTitle = data.title
        },
		
        // 设置下单页面参数
        setOrderParams (state, data = '') {
            state.orderParams = data
        },
		
        // 设置去中心化基金是否开启测试模式
        setTestMode (state, value) {
            state.isTestMode = value
            localSet('isTestMode', value)
        },
		
        // 设置切换账户环境下拉菜单是否显示
        setAccountEnv (state, value) {
            state.isAccountEnv = value
        },
        // 设置真实模拟切换的状态
        setSwitchAccounting (state, value) {
            state.switchAccounting = value
        },
        // 修改访问权限状态
        setAccessFlag (state, value) {
            state.accessFlag = value
        },
    },
    actions: {
        // 获取app信息
        getAppInfo ({ state }) {
            // #ifdef APP-PLUS
            plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
                console.log('app信息', wgtinfo)
                state.appInfo = wgtinfo
            })
            // #endif
        },
		
	    // 获取系统信息
	    getSystemInfo ({ state }) {
	        uni.getSystemInfo({
	            success: function (res) {
	                // ipad标题栏高度
	                if (res.model.indexOf('iPad') !== -1) {
	                    res.titleBarHeight = 80
	                } else if (res.system.indexOf('iOS') !== -1) {
	                    // ios标题栏高度
	                    res.titleBarHeight = 44
	                } else {
	                    // android标题栏高度
	                    res.titleBarHeight = 48
	                }
	                // 导航栏高度
	                res.navbarHeight = res.statusBarHeight + res.titleBarHeight
	                // 保存系统信息
	                state.systemInfo = res
	                console.log('系统信息', res)
	            }
	        })
	    },
		
        // 获取app配置数据
        getAppConfig ({ state }) {
            const isProduction = process.env.NODE_ENV === 'production'
            const platform = (state.systemInfo?.platform === 'ios') ? 'ios' : 'android'
            const apiBase = apiConfig.apiBase
            return new Promise(resolve => {
                if (isProduction) {
				    uni.request({
				        url: `${apiBase}/bc/app.json`,
				        data: {
				            timestamp: Date.now()
				        },
                        sslVerify: false,
				        success: res => {
                            if (res.statusCode === 200) {
                                const data = res.data
                                state.appConfig = data[platform]
                                state.config = data
                            } else {
                                state.appConfig = app[platform]
                                state.config = app
                            }
                            resolve()
				        },
				        fail: err => {
				            state.appConfig = app[platform]
				            state.config = app
                            resolve()
				        }
				    })
                } else {
				    state.appConfig = app[platform]
				    state.config = app
                    resolve()
                }
            })
        }, 

        // 获取cats2系统维护配置
        getConfigSystem ({ rootState }, isPage = false) {
            const isProduction = process.env.NODE_ENV === 'production'
            const inited = rootState._base.inited
            const apiBase = apiConfig.apiBase
            if (!isProduction || !inited) return
            return new Promise((resolve, reject) => {
                uni.request({
                    url: 'https://cats2.oss-cn-hongkong.aliyuncs.com/configSystem/configSystem.json',
                    data: {
                        timestamp: Date.now()
                    },
                    sslVerify: false,
                    success: res => {
                        if (res.data) {
                            const { companyId } = rootState._base.wpCompanyInfo
                            const { maintenance, exception, domain } = res.data
                            const isQA = domain.find(el => apiBase.includes(el)) && exception.indexOf(Number(companyId)) > -1 
                            /* 
								maintenance 是否需要升级
								isQA: 是否为QA公司
								isPage: 当前是否在升级维护页面
							*/
                            // 需要升级维护，跳转到升级维护页
                            if (maintenance && !isQA) {
                                if (!isPage) {
                                    uni.reLaunch({
                                        url: '/pages/webview/upgradeMaintenance'
                                    })
                                }
                            } else {
                                // 不需要升级维护，跳转到首页
                                if (isPage) {
                                    uni.switchTab({
                                        url: '/pages/home/index'
                                    })
                                }
                            }
                            resolve(res)
                        } else {
                            reject(res)
                        }
                    }
                })
            })
        },
        checkGeoipCountry ({ state, commit, rootGetters }, param) {
            const noAccessArea = state.config?.noAccessArea
            if (!noAccessArea || noAccessArea.length === 0) {
                // if (path) router.push(path)
            }
            return geoipCountry().then(res => {
                if (res.code === '0' && res.data?.iso_code) {
                    if (noAccessArea.length > 0) {
                        const arr = noAccessArea.filter(el => el.toLowerCase() === res.data?.iso_code.toLowerCase())
                        commit('setAccessFlag', arr.length === 0)
                        // arr.length > 0 && redirect ? router.replace('/noAccess') : router.push(path)
                        return arr.length
                    }
                }
            })
        }
    }
}

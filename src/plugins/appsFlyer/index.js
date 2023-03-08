import Vue from 'vue'
import businessConfig from './business'
let appsFlyer = null

// 创建appsFlyer
export function createAppsFlyer() {
	// #ifdef APP-PLUS
	appsFlyer = uni.requireNativePlugin('sn-appsflyer')
	const data = businessConfig[plus.runtime.appid]
	if (!appsFlyer || !data) return
	
	// 初始化
	appsFlyer.initSdk({ 
		// 必填项
		devKey: data.devKey,
		isDebug: false,
		appId: data.appId, // 苹果app store appid
		timeToWaitForATTUserAuthorization: 10, // for iOS 14.5
		// 以下是非必填项
		onInstallConversionDataListener: true, //是否监听安装转化数据，开启之后，数据回调则通过initSdk回调传递
		onDeepLinkListener: true, // 是否监听DeepLink，开启之后，数据回调则通过registerDeepLink回调传递
		collectAndroidID: false, // 是否收集androidID
		collectIMEI: false // 是否收集IMEI
	}, (e) => {
		console.log('appsFlyer初始化成功', e)
	})
	
	// 注册AppOpenAttribution
	appsFlyer.onAppOpenAttribution({}, (e) => {
		console.log('appsFlyer onAppOpenAttribution', e) 
	})
	
	// 注册DeelLink事件
	appsFlyer.registerDeepLink({}, (e) => {
		console.log('appsFlyer deepLink', e) 
	}) 
	// #endif
}

// 添加appsFlyer应用内事件
export function addAppsFlyerEvent(eventName = '', eventValues = {}) {
	// #ifdef APP-PLUS
	const data = businessConfig[plus.runtime.appid]
	if (!appsFlyer || !data) return
	appsFlyer.logEvent({
	    eventName,
	    eventValues 
	}, (e) => {
		console.log('appsFlyer事件添加成功' + eventName, e)
	})
	// #endif
}

Vue.prototype.$addAppsEvent = (eventName, eventValues) => {
	addAppsFlyerEvent(eventName, eventValues)
}


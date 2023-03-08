import store from '@/store'
let JYGoogleSignin = null

// 创建谷歌登录插件
export function createJYGoogleSignin () {
	// #ifdef APP-PLUS
	JYGoogleSignin = uni.requireNativePlugin('JY-GoogleSignin')
	if (!JYGoogleSignin) return
	
	// 谷歌登录初始化
	const appConfig = store.state._global.appConfig
	JYGoogleSignin.jy_init({
	    //  安卓的client_id应该是谷歌开发者后台默认Web应用的；iOS的client_id应该是谷歌开发者后台iOS对应的
	    client_id: appConfig['google_client_id']
	})
	// #endif
} 

// 谷歌登录
export function JYGoogleLogin () {
	// #ifdef APP-PLUS
	if (!JYGoogleSignin) return
	return new Promise(resolve => {
		JYGoogleSignin.jy_startLogin(res => {
			resolve(res)
		})
	})
	// #endif
}

// 谷歌退出登录
export function JYGoogleLogout () {
	// #ifdef APP-PLUS
	if (!JYGoogleSignin) return
	JYGoogleSignin.jy_logout()
	// #endif
}
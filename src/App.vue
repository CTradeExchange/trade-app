<script>
import store from '@/store/index.js'
import appUpdate from '@/upgrade/utils/check-update'
import { reconnectWebsocket } from '@/plugins/socket/socket'
import { createAppsFlyer } from '@/plugins/appsFlyer'
import { createJYGoogleSignin } from '@/plugins/JYGoogleSignin'
	
export default {
    // 当应用初始化完成时触发（全局只触发一次）
    onLaunch: function () {
        // app升级更新
        appUpdate()
        // 创建appsFlyer
        createAppsFlyer()
        // 拦截tabbar
        this.interceptTabbar()
        // 获取app信息
        store.dispatch('_global/getAppInfo')
        // 获取系统信息
        store.dispatch('_global/getSystemInfo')
        // 获取app配置文件
        store.dispatch('_global/getAppConfig').then(() => {
            // 创建谷歌登录插件
            createJYGoogleSignin()
        })
    },
	
    // 当应用启动，或从后台进入前台触发
    onShow: function () {
        // 重连websocket
        reconnectWebsocket()
    },
	
    // 报错时触发
    onError (err) {
        console.log('uni-app error:', err)
    },
	
    onThemeChange (theme) {
        console.log('当前主题', theme)
    },
	
    // methods
    methods: {
        // 拦截tabbar
        interceptTabbar () {
            uni.addInterceptor('switchTab', {
                invoke (e) {
                    // 设置切换账户环境下拉菜单是否显示
                    store.commit('_global/setAccountEnv', false)
                    // 下单、资产页面拦截
                    const customerInfo = store.state._user.customerInfo
                    const isLogin = ['/pages/order/index', '/pages/assets/index'].includes(e.url)
                    if (isLogin && !customerInfo) {
                        let moduleName = ''
                        if (e.url === '/pages/order/index') moduleName = 'trade'
                        if (e.url === '/pages/assets/index') moduleName = 'assets'
                        uni.navigateTo({
                            url: '/pages/mine/login?module=' + moduleName
                        })
                        return false  
                    } else {
                        return true
                    }
                }
            })
        }
    },
	
    // 全局变量，在页面中统一使用const { globalData } = getApp()获取
    globalData: {}
}
</script>

<style lang="scss">
// 字体图标
@import '~@/static/iconfont/iconfont.css';
page {
    height: 100%;
    font-size: 28rpx;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', miui, 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}
/* #ifdef H5 */
page {
	background-color: var(--contentColor);
}
/* #endif */
::-webkit-scrollbar {
    width: 0;
    height: 0;
    color: transparent;
}
</style>

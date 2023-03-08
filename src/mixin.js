import store from '@/store/index.js'
import dayjs from 'dayjs'
import { localGet } from '@/utils/util.js'

export default {
    computed: {
        // app信息
        appInfo () {
            return store.state._global.appInfo
        },
        // 系统信息
        systemInfo () {
            return store.state._global.systemInfo
        },
        // app配置数据
        $config () {
            return store.state._global.config || {}
        },
        // app当前手机系统配置数据
        $appConfig () {
            return store.state._global.appConfig || {}
        },
        // 当前主题
        currentTheme () {
            return store.state._global.currentTheme
        },
        // 当前语言
        currentLang () {
            return store.state._global.currentLang
        },
        // 涨跌显示方式
        changeColor () {
            return store.state._global.changeColorType.toString()
        },
        // 公司信息
        wpCompanyInfo () {
            return store.state._base.wpCompanyInfo
        },
        // 客户信息
        customerInfo () {
            return store.state._user.customerInfo
        },
        // 颜色变量
        $style () {
		    return store.state.style
        },
        // 是否显示谷歌验证码
        googleCodeVis () {
		    return store.state._user.customerInfo.googleId > 0
        },
        // 时区
        utcOffset () {
            return localGet('utcOffset') || this.$dayjs().utcOffset()
        },
        // 玩法列表长度
        plansLen () {
		    return store.state._base.plans.length
        },
        // 当前玩法是否显示出入金按钮
        isDepositWithdraw () {
		    return this.$config.tradeTypeShowCash?.includes(Number(this.tradeType)) && this.customerInfo.companyType === 'real'
        }
    },
    onShow () {
	    // 设置状态栏颜色
	    uni.setNavigationBarColor({
	        frontColor: this.currentTheme === 'light' ? '#000000' : '#ffffff',
	        backgroundColor: this.currentTheme === 'light' ? '#ffffff' : '#000000'
	    })
		// 设置底部导航栏颜色
		store.commit('_global/setTabBarStyleColor')
    },
    methods: {
        // 打开通知弹窗
        openNotice (title, content) {
            const noticeDialog = this.$refs['noticeDialog']
            if (noticeDialog) {
                noticeDialog.open(title, content)
            }
        },
		
        // 异地登录弹窗
        openDisconnect () {
            const modalDialog = this.$refs['modalDialog']
            if (modalDialog) {
                modalDialog.show({
                    content: this.$t('c.otherPlaceLogin')
                }).then(() => {
                    // 退出登录
                    store.dispatch('_user/logout').then(() => {
					    // 关闭所有页面跳转到登录页面
					    uni.reLaunch({
					        url: '/pages/mine/login'
					    })
                    })
                }).catch(() => {})
            }
        },
		
        // 日期时间格式化
        formatTime (val, fmt = 'YYYY-MM-DD HH:mm:ss') {
            return dayjs(val).format(fmt)
        }
    }
}

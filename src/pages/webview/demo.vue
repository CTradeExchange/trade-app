<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :fixed-title='title' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <web-view ref='webview' :src='url' @message="onMessage($event, 'app')" />
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>	
import store from '@/store/index.js'
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // url地址
            url: '',
            // 标题
            title: 'webview demo',
            // 当前webview
            currentWebview: null
        }
    },
    onReady () {
        // 设置web-view样式
        this.setStyle()
    },
    onLoad () {
        this.$init().then(() => {
            this.url = 'http://192.168.101.3:5173'
            this.skeletonShow = false
        })
		
        // #ifdef H5
        window.addEventListener('message', (evt) => {
            this.onMessage(evt, 'h5')
        })
        // #endif
    },
    onUnload () {
        // #ifdef H5
        window.removeEventListener('message', (evt) => {
            this.onMessage(evt, 'h5')
        })
        // #endif
    },
    methods: {
        // 设置web-view样式
        setStyle () {
            // #ifdef APP-PLUS
            setTimeout(() => {
                const currentWebview = this.$scope.$getAppWebview()
                const systemInfo = this.systemInfo
                const top = systemInfo.navbarHeight
                const height = systemInfo.windowHeight - top
                const wv = currentWebview.children()[0]
                wv.setStyle({ top, height, background: 'transparent' }) 
                this.currentWebview = wv
            }, 200)
            // #endif
        },
		
        // 接收数据
        onMessage (e, type) {
            const data = type === 'app' ? e.detail.data[0] : e.data.data?.arg
            const page = data?.type 
            const params = data?.params
            switch (page) {
                case 'home':
                    this.goHomePage()
                    break
                case 'quote':
                    this.goQuotePage()
                    break
                case 'order':
                    this.goOrderPage(params)
                    break
                case 'assets':
                    this.goAssetsPage()
                    break
                case 'mine':
                    this.goMinePage()
                    break
                case 'chart':
                    this.goChartPage(params)
                    break
                case 'deposit':
                    this.goDepositPage(params)
                    break
                case 'withdraw':
                    this.goWithdrawPage(params)
                    break
                case 'auth':
                    this.goAuthPage()
                    break
                case 'login':
                    this.goLoginPage()
                    break
                case 'register':
                    this.goRegisterPage()
                    break
                case 'service':
                    this.goServicePage()
                    break
                case 'customerInfo':
                    this.getCustomerInfo()
                    break
            }
        },
		
        // 跳转到首页
        goHomePage () {
            uni.switchTab({
                url: '/pages/home/index'
            })
        },
		
        // 跳转行情页面
        goQuotePage () {
            uni.switchTab({
                url: '/pages/quote/index'
            })
        },
		
        // 跳转到资产页面
        goAssetsPage () {
            if (!this.customerInfo) {
                uni.reLaunch({
                    url: '/pages/mine/login'
                })
            } else {
                uni.switchTab({
                    url: '/pages/assets/index'
                })
            }
        },
		
        // 跳转到交易页面
        goOrderPage (params) {
            if (!this.customerInfo) {
                uni.reLaunch({
                    url: '/pages/mine/login'
                })
            } else {
                if (params) {
                    store.commit('_global/setOrderParams', params)
                }
                uni.switchTab({
                    url: '/pages/order/index'
                })
            }
        },
		
        // 跳转到我的页面
        goMinePage () {
            uni.switchTab({
                url: '/pages/mine/index'
            })
        },
		
        // 跳转到图表页面
        goChartPage (params) {
            if (params) {
                this.$method.goChartPage(params)
            }
        },
		
        // 跳转到充值页面
        goDepositPage (params) {
            if (!this.customerInfo) {
                uni.reLaunch({
                    url: '/pages/mine/login'
                })
            } else {
                this.$method.goDeposit(params)
            }
        },
		
        // 跳转到提现页面
        goWithdrawPage (params) {
            if (!this.customerInfo) {
                uni.reLaunch({
                    url: '/pages/mine/login'
                })
            } else {
                this.$method.goWithdraw(params)
            }
        },
		
        // 跳转到身份认证页面
        goAuthPage () {
            if (!this.customerInfo) {
                uni.reLaunch({
                    url: '/pages/mine/login'
                })
            } else {
                uni.navigateTo({
                    url: '/pages/person/authentication'
                })
            }
        },
		
        // 跳转到登录页面
        goLoginPage () {
            uni.navigateTo({
                url: '/pages/mine/login'
            })
        },
		
        // 跳转到注册页面
        goRegisterPage () {
            uni.navigateTo({
                url: '/pages/mine/register'
            })
        },
		
        // 跳转到在线客服页面
        goServicePage () {
            this.$method.toService(this.$t('common.serivce'))
        },
		
        // 获取用户信息
        getCustomerInfo () {
            const data = JSON.stringify(this.customerInfo)
            this.currentWebview.evalJS(`uniCustomerInfo(${data})`) 
        }
    }
}
</script>

<style lang="scss" scoped>
</style>

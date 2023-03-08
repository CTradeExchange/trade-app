<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :fixed-title='title' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <web-view :src='url' @message='onMessage($event,"app")' />
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>	
// vuex
import store from '@/store/index.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // url地址
            url: '',
            // 标题
            title: ''
        }
    },
    onReady () {
        // 设置web-view样式
        this.setStyle()
    },
    onLoad () {
        // 设置web-view地址和标题
        this.url = store.state._global.webUrl
        this.title = store.state._global.webTitle
        setTimeout(() => {
            // store.commit('_global/setWebView', { url: '', title: '' })
            this.skeletonShow = false
        }, 1000)
		
        // #ifdef H5
        window.addEventListener('message', (evt) => {
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
            }, 200)
            // #endif
        },
		
        // 接收数据
        onMessage (e, type) {
            const data = type === 'app' ? e.detail.data[0] : e.data.data?.arg
            if (data?.type === 'v10_order') {
                this.goOrderPage(data.params)
            }
            if (data?.type === 'v10_fund') {
                this.goFundPage(data.params)
            }
        },
		
        // 跳转到下单页面
        goOrderPage (params) {
            if (this.customerInfo) {
                store.commit('_global/setOrderParams', params)
                uni.switchTab({
                    url: '/pages/order/index'
                })
            } else {
                uni.reLaunch({
                    url: '/pages/mine/login?module=chart'
                })
            }
        },
		
        // 跳转基金交易页面
        goFundPage (params) {
            if (this.customerInfo) {
                uni.navigateTo({
                    url: `/pages/fund/deal?fundId=${params.fundId}&type=apply`
                })
            } else {
                uni.reLaunch({
                    url: '/pages/mine/login?module=fund'
                })
            }
        }
    },
    onUnload () {
        // #ifdef H5
        window.removeEventListener('message', (evt) => {
            this.onMessage(evt, 'h5')
        })
        // #endif
    }
}
</script>

<style lang="scss" scoped>
</style>

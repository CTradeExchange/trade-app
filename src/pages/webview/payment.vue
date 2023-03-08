<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar custom-back :title="$t('cRoute.deposit')" @back='onBack' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <web-view :src='url' />
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>	
// utils
import { sessionGet, sessionRemove } from '@/utils/util'
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // url地址 
            url: '',
            // 玩法类型
            tradeType: '',
            // 货币
            currency: '',
            // 账户id
            accountId: ''
        }
    },
    onReady () {
        // 设置web-view样式
        this.setStyle()
        // 设置web-view组件url地址
        this.setUrl()
    },
    onLoad (options) {
        this.tradeType = options.tradeType
        this.currency = options.currency
        this.accountId = options.accountId
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    // 页面卸载
    onUnload () {
        sessionRemove('formUrl')
        sessionRemove('formData')
        sessionRemove('browserOpenUrl')
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
		
        // 设置web-view组件url地址 
        setUrl () {
            const formUrl = encodeURIComponent(sessionGet('formUrl')) 
            const formData = encodeURIComponent(sessionGet('formData'))
            const browserOpenUrl = sessionGet('browserOpenUrl')
            // 直接使用http地址
            if (browserOpenUrl) {
                this.url = browserOpenUrl
            } else {
                // 本地表单提交页面
                this.url = `/hybrid/html/payment.html?formUrl=${formUrl}&formData=${formData}`
            }   
        },
		
        // 头部导航栏返回
        onBack () {
            uni.redirectTo({
                url: `/pages/deposit/choose?tradeType=${this.tradeType}&isCallback=true`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
</style>

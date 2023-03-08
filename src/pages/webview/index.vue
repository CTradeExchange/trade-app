<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :close-show='true' :fixed-title='title' @close='onClose' />
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
            this.skeletonShow = false
        }, 1000)
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
            }, 30)
            // #endif
        },
        // 关闭webview
        onClose () {
            // #ifdef H5
            uni.navigateBack({
                delta: 1
            })
            // #endif
            // #ifndef H5
            const currentWebview = this.$scope.$getAppWebview()
            currentWebview.close()
            // #endif
        }
    }
}
</script>

<style lang="scss" scoped>
</style>

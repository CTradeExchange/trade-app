<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('common.question')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <answers-explain />
            </view>
        </view>
    </view>
</template>

<script>
import answersExplain from './components/answers-explain'
	
export default {
    components: {
        answersExplain
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 类型 1.直充 2.汇兑
            type: 1
        }
    },
    onLoad (options) {
        this.type = Number(options.type) || 1
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
        }).catch(() => {
            this.skeletonShow = false
        })
    }
}
</script>

<style lang='scss' scoped>
</style>

<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar :title='$t("route.fundRules")' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <tui-tabs
                    class='tabs'
                    :color='$style.minorColor'
                    :current-tab='currentIndex'
                    :height='88'
                    :item-width="(100 / tabList.length) + '%'"
                    :padding='0'
                    :selected-color='$style.primary'
                    :slider-bg-color='$style.primary'
                    :slider-width='90'
                    :tabs='tabList'
                    unlined
                    @change='changeTab'
                />
                <!-- 申购规则 -->
                <apply-rules v-if="type === 'apply'" :fund='fund' />
                <!-- 赎回规则 -->
                <redeem-rules v-if="type === 'redeem'" :fund='fund' />
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import applyRules from './components/apply-rules.vue'
import redeemRules from './components/redeem-rules.vue'
import store from '@/store'

export default {
    components: {
        applyRules,
        redeemRules
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 申赎类型 apply:申购 redeem:赎回
            type: '',
            // 基金id
            fundId: '',
            // 选项卡数据
            tabList: [
                { name: this.$t('fundInfo.applyRules'), val: 'apply' },
                { name: this.$t('fundInfo.redeemRules'), val: 'redeem' }
            ],
            // 当前选项卡
            currentIndex: 0
        }
    },
    computed: {
        // 基金数据
        fund () {
            return store.state._quote.fundInfo || {}
        }
    },
    watch: {
        // 监听申赎类型
        type () {
            this.currentIndex = this.tabList.findIndex(el => el.val === this.type)
        }
    },
    onLoad (options) {
        this.type = options.type
        this.fundId = options.fundId
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.getFundInfo()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('fund_rules_view')
    },
    methods: {
        // 获取基金详情
        getFundInfo () {
            store.dispatch('_quote/queryFundInfo', this.fundId)
        },
		
        // 切换选项卡
        changeTab (e) {
            this.type = this.tabList[e.index].val
        }
    }
}
</script>

<style lang="scss" scoped>
.tabs {
	margin: 20rpx 0;
}
</style>

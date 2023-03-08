<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :right-text='rightText' :title='title' @link='onLink' />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='currencyBar'>
                    <currency-icon :currency='fund.shareTokenCode' :size='60' />
                    <span class='fundCurrency'>
                        {{ fund.fundName }}
                    </span>
                </view>
                <view class='tradeFormBar'>
                    <!-- 基金申购 -->
                    <fund-apply 
                        v-if="type === 'apply'" 
                        :fund='fund' 
                        @switch='switchType'
                    />
                    <!-- 基金赎回 -->
                    <fund-redeem 
                        v-if="type === 'redeem'" 
                        :fund='fund' 
                        @switch='switchType'
                    />
                </view>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import store from '@/store'	
import fundApply from './components/fund-apply.vue'
import fundRedeem from './components/fund-redeem.vue'
	
export default {
    components: {
        fundApply,
        fundRedeem
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 基金id
            fundId: '',
            // 申赎类型 apply:申购 redeem:赎回
            type: '',
            // 标题
            title: '',
            // 链接标题
            rightText: ''
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
            this.title = this.type === 'apply' ? this.$t('route.fundPurchase') : this.$t('route.fundRedemption')
            this.rightText = this.type === 'apply' ? this.$t('fundInfo.applyRules1') : this.$t('fundInfo.redeemRules1')
        }
    },
    onLoad (options) {
        this.fundId = options.fundId
        this.type = options.type
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('fund_deal_view')
    },
    onShow () {
        this.getCustomerInfo()
    },
    methods: {
        // 页面初始化
        pageInit () {
            store.dispatch('_quote/queryFundInfo', this.fundId)
            store.dispatch('_quote/fundNetValue', { fundId: this.fundId })
            this.getCustomerInfo()
        },
		
        // 获取用户信息
        getCustomerInfo () {
            if (this.customerInfo) {
                store.dispatch('_user/findCustomerInfo', false)
            }
        },
		
        // 跳转到交易规则页面
        onLink () {
            uni.navigateTo({
                url: '/pages/fund/rules?type=' + this.type + '&fundId=' + this.fundId
            })
        },
		
        // 切换申购、赎回方式
        switchType (type) {
            this.type = type
        }
    }
}
</script>

<style lang="scss" scoped>
.currencyBar {
	@include styles('background', 'contentColor');
	@include flexAlign;
	flex-shrink: 0;
	height: 120rpx;
	margin-top: 20rpx;
	padding: 0 rem(30px);
}
.fundCurrency {
	font-size: rem(32px);
	margin-left: 20rpx;
}
</style>

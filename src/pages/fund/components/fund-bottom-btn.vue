<template>
    <div class='footerBtnBox'>
        <div v-if='fund' class='trade-btn-wrap'>
            <div class='buy fallColorBg' :class='{ disabled: fund.canPurchase !== 1 }' @click="toOrder('apply')">
                <span class='text'>
                    {{ fund.canPurchase === 1 ? $t('fundInfo.buy'): $t('fundInfo.disabledBuy') }}
                </span>
            </div>
            <div class='sell riseColorBg' :class='{ disabled: fund.canRedemption !==1 }' @click="toOrder('redeem')">
                <span class='text'>
                    {{ fund.canRedemption === 1 ? $t('fundInfo.sell'):$t('fundInfo.disabledSell') }}
                </span>
            </div>
            <view class='tradeBtn' @click='toOrderFund'>
                <view class='text' :class='{ small: fund.canPurchase!==1 && fund.canRedemption!==1 }'>
                    {{ $t('route.trade') }}
                </view>
            </view>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        // 基金数据
        fund: {
            type: Object,
            default: () => {}
        }
    },
    methods: {
        // 跳转到基金申购页面
        toOrder (type) {
            if (this.fund.canPurchase !== 1 || this.fund.canRedemption !== 1) return
            if (this.customerInfo) {
                uni.navigateTo({
                    url: `/pages/fund/deal?fundId=${this.fund.fundId}&type=${type}`
                })
            } else {
                uni.navigateTo({
                    url: '/pages/mine/login?module=fund'
                })
            }
			
            // 添加应用内事件
            this.$addAppsEvent('fund_' + type + '_click')
        },
		
        // 点击前往交易页面的对应产品
        toOrderFund  () {
            const productList = this.$store.state._quote.productList
            let product = productList.find(el => el.baseCurrency === this.fund.shareTokenCode && el.profitCurrency === 'USDT' && el.tradeType === 5)
            if (!product) {
                product = productList.find(el => el.baseCurrency === this.fund.shareTokenCode && el.tradeType === 5)
            }
            if (!product) {
                return uni.showToast({
                    title: this.$t('fundInfo.noTradeMarket'),
                    icon: 'none'
                })
            }
            this.$method.goChartPage(product)
            
            // 添加应用内事件
            this.$addAppsEvent('fund_trade_click')
        }
    }
}
</script>

<style lang="scss" scoped>
.footerBtnBox {
	@include styles('background', 'contentColor');
    display: flex;
    width: 100%;
    text-align: center;
    .trade-btn-wrap {
        position: relative;
        display: flex;
        flex: 1;
        flex-direction: row;
        flex-wrap: nowrap;
        padding: rem(20px);
        white-space: nowrap;
        font-weight: bold;
        .buy {
            margin-right: rem(20px);
        }
    }
    .sell,
    .buy,
    .tradeBtn {
        @include active();
        position: relative;
        flex: 1;
        color: #fff;
        line-height: rem(100px);
        background-color: #858c9a;
        border-radius: 3px;
        &.fallColorBg {
			@include styles('background', 'riseColor');
			color: #fff !important;
        }
        &.riseColorBg {
			@include styles('background', 'fallColor');
			color: #fff !important;
        }
        &.disabled{
			@include styles('background', 'minorColor');
            opacity: .5;
        }
        .text {
            font-size: rem(34px);
            vertical-align: middle;
        }
    }
    .sell::after {
        position: absolute;
        top: 0;
        right: 0;
        width: 1px;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.15);
        content: '';
    }
    .tradeBtn {
        flex: none;
        width: 140rpx;
        margin-left: 20rpx;
    }
    .text {
        font-size: rem(28px);
        vertical-align: middle;
    }
}
</style>

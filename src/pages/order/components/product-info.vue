<template>
    <view class='product-info'>
        <view class='row'>
            <label @click="$emit('open')">
                <i class='iconfont icon_quanrejiaohuan-'></i>
                <span class='name'>
                    {{ product.symbolName }}
                </span>
            </label>
            <etf-icon v-if='product.etf' />
            <view class='ratio' :class='product.rolling_upDownColor'>
                {{ product.rolling_upDownWidth }}
            </view>
        </view>
        <i class='iconfont icon_tubiao' @click='goChartPage'></i>
    </view>
</template>

<script>
export default {
    props: {
        // 产品
        product: {
            type: Object,
            default: () => {}
        }
    },
    methods: {
        // 跳转到图表页面
        goChartPage () {
            this.$method.goChartPage(this.product)
            // 添加应用内事件
            this.$addAppsEvent('trade_chart_click')
        }
    }
}
</script>

<style lang="scss" scoped>
.product-info {
	@include flexBetweenAlign;
	@include styles('background-color', 'contentColor');
	height: 100rpx;
	padding: 0 30rpx;
	.row {
		@include flexAlign;
		label {
			display: inline-flex;
			align-items: center;
		}
		.icon_chouti {
			font-size: 32rpx;
		}
		.name {
			margin: 0 20rpx;
			font-size: 32rpx;
			font-weight: bold;
		}
		.ratio {
			font-size: 32rpx;
		}
	}
	.icon_tubiao {
		@include styles('color', 'normalColor');
		font-size: 30rpx;
	}
	::v-deep .etf-icon {
		margin-right: 10rpx;
	}
}
</style>

<template>
    <view class='direction' :class="{ 'center': product.dealMode && dealModeShowMap[product.dealMode].handicap }">
        <view
            :class="{ 'item buy-btn': true, 'buy-active': modelValue === 'buy' }" 
            @click="setDirection('buy')"
        >	
            <span class='name'>
                {{ $t('trade.buy') }}
            </span>
            <span v-if='product.dealMode && !dealModeShowMap[product.dealMode].handicap' class='price'>
                {{ product.buy_price }}
            </span>
            <view class='check'>
                <tui-icon class='tick' name='check' :size='24' unit='rpx' />
            </view>
        </view>
        <view 
            :class="{ 'item sell-btn': true, 'sell-active': modelValue === 'sell' }" 
            @click="setDirection('sell')"
        >
            <span v-if='product.dealMode && !dealModeShowMap[product.dealMode].handicap' class='price'>
                {{ product.sell_price }}
            </span>
            <span class='name'>
                {{ $t('trade.sell') }}
            </span>
            <view class='check'>
                <tui-icon class='tick' name='check' :size='24' unit='rpx' />
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 方向
        modelValue: {
            type: String,
            default: ''
        },
        // 产品
        product: {
            type: Object,
            default: () => {}
        },
        // 成交模式
        dealModeShowMap: {
            type: Object,
            default: () => {}
        }
    },
    methods: {
        // 设置方向
        setDirection (value) {
            this.$emit('update:modelValue', value)
        }
    }
}
</script>

<style lang="scss" scoped>
.direction {
	@include flexBetween;
	position: relative;
	.item {
		@include styles('color', 'normalColor');
		@include styles('border-color', 'normalColor');
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
		height: 80rpx;
		padding: 0 30rpx;
		border-width: 1px;
		border-style: solid;
		border-radius: 6rpx;
		position: relative;
		&:first-of-type {
			margin-right: 20rpx;
		}
		.name {
			letter-spacing: 2rpx;
			font-size: 28rpx;
			font-weight: bold;
		}
		.price {
			font-size: 30rpx;
			font-weight: bold;
		}
		.check {
			display: none;
			justify-content: center;
			align-items: center;
			width: 30rpx;
			height: 30rpx;
			border-radius: 0 10rpx 0 10rpx;
			position: absolute;
			top: -1px;
			right: -1px;
			.tick {
				color: #fff !important;
			}
		}
	}
	.buy-active {
		@include styles('color', 'riseColor');
		@include styles('border-color', 'riseColor');
		.check {
			@include styles('background', 'riseColor');
			display: flex;
		}
	}
	.sell-active {
		@include styles('color', 'fallColor');
		@include styles('border-color', 'fallColor');
		.check {
			@include styles('background', 'fallColor');
			display: flex;
		}
	}
}
.center {
	.item {
		justify-content: center;
	}
}
</style>

<template>
    <view class='profitloss-set'>
        <!-- 止损价提示 -->
        <float-tip v-if='stopLossWarn'>
            {{ stopLossWarn }}
        </float-tip>
        <!-- 止盈价提示 -->
        <float-tip v-if='stopProfitWarn && !stopLossWarn'>
            {{ stopProfitWarn }}
        </float-tip>
        <view class='toggle-module'>
            <view class='title'>
                {{ $t('trade.tackStopSetup') }}
            </view>
            <switch :checked='modelValue' :color='$style.primary' @change='onSwitch' />
        </view>
        <view v-if='modelValue' class='body-module'>
            <view :class="{ 'handle': true, 'column': product.symbolName && dealModeShowMap[product.dealMode].handicap }">
                <view class='title'>
                    <strong>{{ $t('trade.stopLossPrice') }}</strong>
                    <span>&le; {{ stopLossRange[1] }}</span>
                </view>
                <number-box
                    :digits='product.price_digits'
                    :max='stopLossRange[1]'
                    :min='stopLossRange[0]'
                    :model-value.sync='stopLossPrice'
                    :step='step'
                />
            </view>
            <view :class="{ 'handle': true, 'column': product.symbolName && dealModeShowMap[product.dealMode].handicap }">
                <view class='title'>
                    <strong>{{ $t('trade.stopProfitPrice') }}</strong>
                    <span>&ge; {{ profitRange[0] }}</span>
                </view>
                <number-box
                    :digits='product.price_digits'
                    :max='profitRange[1]'
                    :min='profitRange[0]'
                    :model-value.sync='stopProfitPrice'
                    :step='step'
                />
            </view>
        </view>
    </view>
</template>

<script>
import store from '@/store/index.js'
import { profitLossPriceCompare } from '@/utils/util.js'
import { pow } from '@/utils/calculation.js'
// components
import floatTip from './float-tip.vue'
	
export default {
    components: {
        floatTip
    },
    props: {
        // 是否启用止盈止损
        modelValue: {
            type: Boolean,
            default: false
        },
        // 方向
        direction: {
            type: String,
            default: ''
        },
        // 产品
        product: {
            type: Object,
            default: () => {}
        },
        // 挂单价
        pendingPrice: {
            type: String,
            default: ''
        },
        // 成交模式
        dealModeShowMap: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 方向value 1:buy 2:sell
            directionVal: 1,
            // 止损价
            stopLossPrice: '',
            // 止盈价
            stopProfitPrice: ''
        }
    },
    computed: {
        // 步数
        step () {
            return pow(0.1, this.product?.price_digits) 
        },
        // 止盈止损范围
        profitLossRang () {
            return store.getters['_trade/marketProfitLossRang']
        },
        // 止损范围
        stopLossRange () {
            const profitLossRang = this.profitLossRang
            return this.direction === 'buy' ? profitLossRang.buyStopLossRange : profitLossRang.sellStopLossRange
        },
        // 止盈范围
        profitRange () {
            const profitLossRang = this.profitLossRang
            return this.direction === 'buy' ? profitLossRang.buyProfitRange : profitLossRang.sellProfitRange
        },
        // 止损价提示
        stopLossWarn () {
            const directionVal = this.directionVal
            const result = profitLossPriceCompare('stopLoss', directionVal, this.stopLossPrice, this.profitLossRang, this)
            return result
        },
        // 止盈价提示
        stopProfitWarn () {
            const directionVal = this.directionVal
            const result = profitLossPriceCompare('profit', directionVal, this.stopProfitPrice, this.profitLossRang, this)
            return result
        }
    },
    watch: {
        // 监听方向
        direction: {
            handler (val) { 
                this.directionVal = val === 'buy' ? 1 : 2
                this.stopLossPrice = ''
                this.stopProfitPrice = ''
            }, 
            immediate: true
        },
        // 监听止损价
        stopLossPrice () {
            this.$emit('update:stopLossPrice', this.stopLossPrice)
        },
        // 监听止盈价
        stopProfitPrice () {
            this.$emit('update:stopProfitPrice', this.stopProfitPrice)
        },
        // 监听挂单价
        pendingPrice () {
            store.commit('_trade/Update_pendingPrice', { price: this.pendingPrice, direction: this.direction })
        }
    },
    methods: {
        // 开启、关闭止盈止损
        onSwitch (e) {
            this.$emit('update:modelValue', e.detail.value)
            if (!this.enabled) {
                this.stopLossPrice = ''
                this.stopProfitPrice = ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.profitloss-set {
	.toggle-module {
		@include flexBetweenAlign;
		height: 90rpx;
	}
	.body-module {
		@include styles('border-top-color', 'lineColor');
		border-top-width: 1px;
		border-top-style: solid;
		.handle {
			@include flexBetweenAlign;
			margin-top: 20rpx;
			.title {
				@include flexColumn;
				strong {
					@include styles('color', 'minorColor');
					margin-bottom: 4rpx;
					font-size: 24rpx;
				}
				span {
					@include styles('color', 'color');
					font-size: 24rpx;
				}
			}
		}
		.column {
			flex-direction: column;
			align-items: flex-start;
			.title {
				margin-bottom: 5rpx;
			}
		}
	}
}
</style>

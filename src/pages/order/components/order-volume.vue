<template>
    <view class='order-volume'>
        <view v-if='product.tradeType === 2' class='switch' @click='switchEntryType'>
            <view class='left'>
                <span>{{ entryType === 1 ? $t('trade.volumes') : $t('trade.margin') }}</span>
            </view>
            <view class='right'>
                <i class='iconfont icon_qiehuan1'></i>
                <span>{{ entryType === 1 ? $t('trade.margin') : $t('trade.volumes') }}</span>
            </view>
        </view>
        <view class='box'>
            <label v-if='!inputVal' class='tip'>
                {{ placeholder }}
            </label>
            <input 
                v-model='inputVal' 
                placeholderClass='placeholderClass'
                type='digit'
                @input='onInput'
            />
        </view>
    </view>
</template>

<script>	
export default {
    props: {
        // 手数数量
        modelValue: {
            type: [String, Number],
            default: ''
        },
        // 玩法类型
        tradeType: {
            type: [String, Number],
            default: ''
        },
        // 最小手数
        minVolume: {
            type: [String, Number],
            default: ''
        },
        // 下单类型 1.数量 2.成交额
        entryType: {
            type: Number,
            default: 1
        },
        // 产品数据
        product: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            inputVal: ''
        }
    },
    computed: {
        // 输入框提示
        placeholder () {
            const curTradeType = Number(this.tradeType)
            if (curTradeType === 1) {
                const account = this.customerInfo?.accountList?.find(el => el.tradeType === curTradeType)
                const product = this.product
                const volumeRange = product.minVolume ? `${this.$t('trade.orderVolume')} ${product.minVolume + this.$t('trade.volumeUnit')} - ${product.maxVolume + this.$t('trade.volumeUnit')}` : ''
                return this.entryType === 1 ? volumeRange : this.$t('trade.orderAmount') + `(${account?.currency})`
            } else if (curTradeType === 2) {
                const account = this.customerInfo?.accountList?.find(el => el.tradeType === curTradeType)
                return this.entryType === 1 ? this.$t('trade.orderVolume') + '(' + this.$t('trade.volumeUnit') + ')' : this.$t('trade.margin') + `(${account?.currency})`
            } else if ([3, 5].includes(curTradeType)) {
                return this.entryType === 1 ? this.$t('trade.orderVolume') + `(${this.product.baseCurrency})` : this.$t('trade.orderAmount') + `(${this.product.profitCurrency})`
            } else {
                return this.entryType === 1 ? this.$t('trade.volumes') : this.$t('trade.orderAmount')
            }
        }
    },
    watch: {
        modelValue () {
            this.inputVal = this.modelValue
        }
    },
    methods: {
        // 修改数量
        onInput () {
            this.$emit('update:modelValue', this.inputVal)
            this.$emit('change', this.inputVal)
        },
		
        // 切换下单类型
        switchEntryType () {
            this.$emit('update:entryType', this.entryType === 1 ? 2 : 1)
        }
    }
}
</script>

<style lang="scss" scoped>
.order-volume {
	.switch {
		@include flexBetweenAlign;
		margin-bottom: 12rpx;
		.right {
			@include styles('color', 'primary');
			.icon_qiehuan1 {
				margin-right: 10rpx;
				font-size: 22rpx;
			}
			span {
				font-size: 26rpx;
			}
		}
	}
	.box {
		@include styles('background-color', 'assistColor');
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80rpx;
		position: relative;
		.tip {
			font-size: 28rpx;
			@include styles('color', 'placeholdColor');
		}
		input {
			width: 100%;
			height: 80rpx;
			text-align: center;
			font-size: 30rpx;
			position: absolute;
			top: 0;
			left: 0;
		}
	}
}
</style>

<template>
    <view class='tradeAssetBar'>
        <!-- 选择框 -->
        <view v-if='isSelect' class='assetCell' @click="$emit('openSelect')">
            <view class='leftCell'>
                <view class='label'>
                    <view class='inline' @click.stop="$emit('openExplain')">
                        <span>{{ label }}</span>
                        <tui-icon class='explain' name='explain' :size='34' unit='rpx' />
                    </view>
                </view>
                <view class='row'>
                    <currency-icon class='currencyImg' :currency='currency' :size='44' />
                    <view>
                        <view class='currency'>
                            {{ currency === 'self' ? $t('fundInfo.basketAssets') : currency }}
                        </view>
                        <view v-if="currency === 'self'" class='assets'>
                            <span v-if="direction === 'apply'">
                                {{ $t('fundInfo.applyCountTip', { count: fundAssetsList.length }) }}
                            </span>
                            <span v-else>
                                {{ $t('fundInfo.redeemCountTip', { count: fundAssetsList.length }) }}
                            </span>
                        </view>
                    </view>
                </view>
            </view>
            <view class='rightCell'>
                <tui-icon :color='$style.placeholdColor' name='turningdown' :size='48' unit='rpx' />
            </view>
        </view>
        <!-- 输入框 -->
        <view v-else class='assetCell'>
            <view class='leftCell'>
                <view class='label'>
                    <span>{{ label }}</span>
                </view>
                <view class='row'>
                    <currency-icon class='currencyImg' :currency='currency' :size='44' />
                    <view class='currency'>
                        {{ currency }}
                    </view>
                </view>
            </view>
            <view class='rightCell'>
                <input
                    v-model='inputValue'
                    :disabled='disabled'
                    :placeholder='placeholder'
                    placeholder-class='placeholderClass'
                    @input='onInput'
                />
                <tui-icon
                    v-if='inputValue'
                    class='clear-close'
                    name='close-fill'
                    @click='onClear'
                />
            </view>
        </view>
    </view>
</template>

<script>
import { limitNumber, limitDecimal } from '@/utils/calculation.js'
import { debounce } from '@/utils/util.js'
export default {
    props: {
        // 标题
        label: {
            type: String,
            default: ''
        },
        // 当前币种
        currency: {
            type: String,
            default: ''
        },
        // 输入框默认值
        value: {
            type: String,
            default: ''
        },
        // 输入框提示内容
        placeholder: {
            type: String,
            default: ''
        },
        // 最多可输入的小数位
        digits: {
            type: [String, Number],
            default: ''
        },
        // 是否可选择
        isSelect: {
            type: Boolean,
            default: false
        },
        // 基金底层资产列表
        fundAssetsList: {
            type: Array,
            default: () => []
        },
        // 类型 apply:申购 redeem:赎回
        direction: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            // 防抖更新输入数据
            inputHandler: null,
            // 输入框的值
            inputValue: ''
        }
    },
    computed: {
        // 是否禁用输入框
        disabled () { 
            if (!this.customerInfo) return true 
            return false
        } 
    },
    watch: {
        // 监听value
        value () {
            if (this.inputValue !== this.value) {
                this.inputValue = this.value
            }
        }
    },
    mounted () {
        this.inputValue = this.value
        this.inputHandler = debounce((val) => {
            this.$emit('input', this.inputValue)
        }, 800)
    },
    methods: {
        // 输入内容
        onInput () {
            if (this.digits !== '') {
                setTimeout(() => {
                    const value = limitNumber(this.inputValue)
                    this.inputValue = limitDecimal(value, this.digits)
                    this.inputHandler(this.inputValue)
                }, 10)
            }
        },
		
        // 清空输入内容
        onClear () {
            this.inputValue = ''
            this.$emit('input', this.inputValue)
        }
    }
}
</script>

<style lang="scss" scoped>
.assetCell {
	@include styles('background', 'assistColor');
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-radius: 12rpx;
	.leftCell {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		.label {
			@include styles('color', 'minorColor');
			display: flex;
			align-items: center;
			font-size: 32rpx;
			.inline {
				display: inline-flex;
				align-items: center;
			}
			span {
				margin-right: 10rpx;
			}
		}
		.row {
			display: inline-flex;
			align-items: center;
			margin-top: 20rpx;
			.currency {
				font-weight: bold;
				font-size: 30rpx;
			}
			.currencyImg {
				align-self: flex-start;
				margin-right: 15rpx;
			}
			.assets {
				@include styles('color', 'minorColor');
				margin-top: 15rpx;
				font-size: 26rpx;
			}
		}
	}
	.rightCell {
		display: flex;
		align-items: center;
		height: 100rpx;
		input {
			width: 360rpx;
			height: 100%;
			font-size: 28rpx;
			text-align: right;
		}
	}
}
</style>

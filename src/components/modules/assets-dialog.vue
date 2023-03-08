<template>
    <tui-bottom-popup :background-color='$style.contentColor' :show='modelValue' @close='onClose'>
        <view class='assets-dialog' @touchmove.stop>
            <view class='header'>
                <view class='header-title'>
                    <span v-if='showTitle'>
                        {{ title || $t('assets.assets') }}
                    </span>
                </view>
                <i class='iconfont icon_guanbi' @click='onClose'></i>
            </view>
            <view class='assets-content'>
                <view class='assets-list'>
                    <view
                        v-for='(item, index) in accountList'
                        :key='index'
                        :class="['item', flex === 1 ? 'item-flex-1' : 'item-flex-2', { active: currency === item.currency }]"
                        @click='checkCurrency(item)'
                    >
                        <image v-if='flex === 2' class='currency-icon' :src='getCurrencyIcon(item.currency)' />
                        <view class='name'>
                            <view class='t1'>
                                {{ item.currency }}
                            </view>
                            <view class='t2'>
                                {{ assetsMap[item.currency] }}
                            </view>
                        </view>
                        <view class='check'>
                            <tui-icon class='tick' name='check' :size='24' unit='rpx' />
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </tui-bottom-popup>
</template>

<script>
import { assetsMap } from '@/utils/enum'	
	
export default {
    props: {
        // 是否显示弹窗
        modelValue: {
            type: Boolean,
            default: false
        },
        // 标题
        title: {
            type: String,
            default: ''
        },
        // 是否显示标题
        showTitle: {
            type: Boolean,
            default: true
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        },
        // 当前账户币种
        currency: {
            type: String,
            default: ''
        },
        // 账户id
        accountId: {
            type: [String, Number],
            default: ''
        },
        // 账户列表
        accountList: {
            type: Array
        },
        // 排版方式 1.一行一个 2.一行两个
        flex: {
            type: Number,
            default: 2
        }
    },
    data () {
        return {
            // 资产数据
            assetsMap
        }
    },
    methods: {
        // 获取币种图标
        getCurrencyIcon (currency) {
            try {
                return require('@/static/image/currency_icon/' + currency + '.png')
            } catch (error) {
                return require('@/static/image/currency_icon/default.png')
            }
        },
		
        // 切换账户币种
        checkCurrency (item) {
            this.$emit('update:currency', item.currency)
            this.$emit('update:accountId', item.accountId)
            this.$emit('update:modelValue', false)
        },
		
        // 关闭弹窗
        onClose () {
            this.$emit('update:modelValue', false)
        }
    }
}
</script>

<style lang="scss" scoped>
.assets-dialog {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 200rpx);
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 36rpx 30rpx;
		.header-title {
			@include styles('color', 'color');
			font-size: 42rpx;
			font-weight: bold;
		}
		.icon_guanbi {
			@include styles('color', 'color');
			font-size: 28rpx;
		}
	}
	.assets-content {
		padding: 0 30rpx;
		flex: 1;
		overflow-y: auto;
	}
	.assets-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		.item {
			@include styles('background', 'assistColor');
			display: flex;
			align-items: center;
			height: 110rpx;
			margin-bottom: 30rpx;
			padding: 0 25rpx;
			border: 1rpx solid transparent;
			border-radius: 10rpx;
			position: relative;
			.currency-icon {
				flex-shrink: 0;
				width: 48rpx;
				height: 48rpx;
				margin-right: 20rpx;
			}
			.t1 {
				font-size: 32rpx;
				@include styles('color', 'color');
			}
			.t2 {
				@include styles('color', 'minorColor');
				margin-top: 4rpx;
				font-size: 24rpx;
			}
			.check {
				display: none;
			}
		}
		.item-flex-1 {
			width: 100%;
			justify-content: center;
		}
		.item-flex-2 {
			width: 48%;
		}
		.active {
			@include styles('background', 'primarybg');
			@include styles('border-color', 'primary');
			.check {
				@include styles('background', 'primary');
				display: flex;
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
	}
}
</style>

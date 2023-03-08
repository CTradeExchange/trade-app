<template>
    <view>
        <tui-bottom-popup background-color='transparent' :radius='false' :show='show' @close='close'>
            <view class='stop-profit'>
                <template v-if='show'>
                    <!-- 止损价提示 -->
                    <view v-if='stopLossWarn' class='warn'>
                        {{ stopLossWarn }}
                    </view>
                    <!-- 止盈价提示 -->
                    <view v-if='stopProfitWarn && !stopLossWarn' class='warn'>
                        {{ stopProfitWarn }}
                    </view>
                </template>
                <tui-icon class='close' name='shut' :size='48' unit='rpx' @click='close' />
                <view class='header-module'>
                    <view class='title'>
                        {{ data.symbolName }}
                    </view>
                </view>
                <view class='body-module'>
                    <view class='row'>
                        <view class='col'>
                            <view class='name'>
                                {{ $t('trade.positionPrice') }}
                            </view>
                            <view class='value'>
                                {{ data.openPrice }}
                            </view>
                        </view>
                        <view class='col'>
                            <view class='name'>
                                {{ $t('trade.currentPrice') }}
                            </view>
                            <view class='value'>
                                <span :class='[Number(data.direction) === 1 ? product.sell_color : product.buy_color]'>
                                    {{ Number(data.direction) === 1 ? product.sell_price : product.buy_price }}
                                </span>
                            </view>
                        </view>
                        <view v-if='product.tradeType === 2' class='col'>
                            <view class='name'>
                                {{ $t('trade.previewStopPrice') }}
                            </view>
                            <view class='value'>
                                {{ data.previewStopPrice || '--' }}
                            </view>
                        </view>
                    </view>
                    <template v-if='show'>
                        <view class='handle'>
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
                        <view class='handle'>
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
                    </template>
                </view>
                <view class='footer-module'>
                    <button class='btn' @click='submitHandler'>
                        {{ $t('save') }}
                    </button>
                </view>
            </view>
        </tui-bottom-popup>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>	
// vuex
import store from '@/store/index.js'
// api
import { updateOrder } from '@/api/trade.js'
// calculation
import { mul, pow, minus, divide } from '@/utils/calculation.js'
// method
import { profitLossPriceCompare } from '@/utils/util.js' 

export default {
    props: {
        // 数据
        data: {
            type: Object,
            default: () => {}
        },
        // 产品
        product: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            // 是否显示弹窗
            show: false,
            // 步数
            step: '',
            // 止损价
            stopLossPrice: '',
            // 止盈价
            stopProfitPrice: ''
        }
    },
    computed: {
        // 持有
        positionVolume () {
            return Number(minus(this.data.openVolume, this.data.closeVolume))
        },
        // 止盈止损范围
        profitLossRang () {
            return store.getters['_trade/marketProfitLossRang'] || {}
        },
        // 止损范围
        stopLossRange () {
            const direction = this.data.direction
            const profitLossRang = this.profitLossRang
            return direction === 1 ? profitLossRang.buyStopLossRange : profitLossRang.sellStopLossRange
        },
        // 止盈范围
        profitRange () {
            const direction = this.data.direction
            const profitLossRang = this.profitLossRang
            return direction === 1 ? profitLossRang.buyProfitRange : profitLossRang.sellProfitRange
        },
        // 止损价提示
        stopLossWarn () {
            const direction = this.data.direction
            const result = profitLossPriceCompare('stopLoss', direction, this.stopLossPrice, this.profitLossRang, this)
            return result
        },
        // 止盈价提示
        stopProfitWarn () {
            const direction = this.data.direction
            const result = profitLossPriceCompare('profit', direction, this.stopProfitPrice, this.profitLossRang, this)
            return result
        },
        // 账户
        account () { 
            return this.customerInfo.accountList.find(item => Number(item.tradeType) === Number(this.data.tradeType)) || {}
        }
    },
    methods: {
        // 打开弹窗
        open () {
            this.show = true
            const data = this.data
            const product = this.product 
            this.step = divide(1, pow(10, product.price_digits)) 
            this.stopLossPrice = data?.stopLoss > 0 ? data.stopLossDecimal : ''
            this.stopProfitPrice = data?.takeProfit > 0 ? data.takeProfitDecimal : ''
        },
		
        // 关闭弹窗
        close () {
            this.show = false
        },
		
        // 获取修改止盈止损参数
        submitParams () {
            const data = this.data
            const product = this.product
            const stopLossPrice = this.stopLossPrice
            const stopProfitPrice = this.stopProfitPrice
            // 未设置
            // if (stopLossPrice === '' && stopProfitPrice === '') {
            //     uni.showToast({
            //         title: this.$t('trade.unModify'),
            //         icon: 'none'
            //     })
            //     return false
            // }
            // 止损价不在范围
            if (this.stopLossWarn) {
                uni.showToast({
                    title: this.stopLossWarn,
                    icon: 'none'
                })
                return false
            }
            // 止盈价不在范围
            if (this.stopProfitWarn) {
                uni.showToast({
                    title: this.stopProfitWarn,
                    icon: 'none'
                })
                return false
            }
			
            const p = pow(10, product.price_digits)
            const params = { 
                orderId: data.orderId,
                positionId: data.positionId,
                stopLoss: !this.stopLossPrice ? 0 : mul(this.stopLossPrice, p),
                takeProfit: !this.stopProfitPrice ? 0 : mul(this.stopProfitPrice, p),
                tradeType: data.tradeType,
                accountId: this.account.accountId,
                accountDigits: this.account.digits
            }
            return params
        },
		
        // 提交修改止盈止损
        submitHandler () {
            const params = this.submitParams()
            if (!params) return false
            uni.showLoading({
                title: this.$t('common.submiting')
            })
            updateOrder(params).then(res => {
                uni.hideLoading()
                uni.showToast({
                    title: this.$t('common.setSuccess'),
                    icon: 'none'
                })
                this.close()
                this.queryPositionList()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        },
		
        // 获取持仓列表
        queryPositionList () {
            store.dispatch('_trade/queryPositionPage', {
                tradeType: this.data.tradeType,
                sortFieldName: 'openTime',
                sortType: 'desc',
                accountId: this.accountId,
                hideLoading: true
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.stop-profit  {
	@include flexColumn;
	@include styles('background-color', 'contentColor');
	height: 680rpx;
	position: relative;
	.warn {
		@include flexAll;
		@include styles('color', 'warn');
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 60rpx;
		background-color: #FFF0E2;
		transform: translateY(-100%);
        font-size: 24rpx;
	}
	.close {
		@include styles('color', 'normalColor');
		position: absolute;
		top: 20rpx;
		right: 20rpx;
	}
	.header-module {
		padding: 40rpx 30rpx;
		.title {
			@include styles('color', 'color');
			font-size: 45rpx;
			font-weight: bold;
		}
	}
	.body-module {
		flex: 1;
		padding: 0 30rpx;
		.row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 50rpx;
			.col {
				display: inline-flex;
				flex-direction: column;
				.name {
					@include styles('color', 'minorColor');
					font-size: 24rpx;
				}
				.value {
					margin-top: 10rpx;
					font-size: 28rpx;
					span {
						margin-right: 6rpx;
					}
				}
			}
		}
		.handle {
			@include flexBetweenAlign;
			margin-bottom: 30rpx;
			.title {
				@include flexColumn;
				strong {
					@include styles('color', 'minorColor');
					margin-right: 5rpx;
					font-size: 28rpx;
				}
				span {
					@include styles('color', 'color');
					font-size: 24rpx;
				}
			}
		}
		.tabs {
			@include flexEndAlign;
			margin-top: 40rpx;
			.item {
				@include flexAll;
				@include styles('background-color', 'primaryAssistColor');
				width: 120rpx;
				height: 50rpx;
				margin-left: 20rpx;
				font-size: 26rpx;
				border-radius: 4rpx;
			}
			.item-active {
				@include styles('background-color', 'primary');
				color: #fff;
			}
		}
	}
	.footer-module {
		.btn {
			@include flexAll;
			@include styles('background-color', 'primary');
			height: 90rpx;
			font-size: 30rpx;
			color: #fff;
		}
	}
}
</style>

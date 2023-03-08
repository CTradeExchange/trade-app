<template>
    <view>
        <tui-bottom-popup background-color='transparent' :radius='false' :show='show' @close='close'>
            <view class='close-position'>
                <!-- 平仓提示 -->
                <view v-if='closeVolumeWarn' class='warn'>
                    {{ closeVolumeWarn }}
                </view>
                <tui-icon class='close' name='shut' :size='48' unit='rpx' @click='close' />
                <view class='header-module'>
                    <view class='title'>
                        {{ data.symbolName }}
                    </view>
                </view>
                <view class='body-module'>
                    <view class='hold'>
                        <b :class="Number(data.direction) === 1 ? 'riseColor' : 'fallColor'">
                            {{ Number(data.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                        </b>
                        <span>{{ positionVolume }} {{ $t('trade.volumeUnit') }}</span>
                    </view>
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
                    </view>
                    <view class='handle'>
                        <view class='title'>
                            {{ $t('trade.closedNumHands') }}
                        </view>
                        <number-box
                            v-if='show'
                            :digits='volumeDigit'
                            :max='positionVolume'
                            :min='product.minVolume'
                            :model-value.sync='count'
                            :placeholder="$t('trade.positionNum')"
                            :step='product.volumeStep'
                            @update:modelValue='updateCount'
                        />
                    </view>
                    <view class='tabs'>
                        <block v-for='item in tabs' :key='item.value'>
                            <view :class="{ 'item': true, 'item-active': item.value === currentValue }" @click='volumeHandler(item)'>
                                {{ item.title }}
                            </view>
                        </block>
                    </view>
                </view>
                <view class='footer-module'>
                    <button class='btn' @click='submitCloseHandler'>
                        {{ $t('trade.confirmClose') }}
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
import { mapGetters } from 'vuex'
// calculation
import BigNumber from 'bignumber.js'
import { pow, minus, divide, getDecimalNum, mul, eq, lt, gt, toFixed } from '@/utils/calculation.js'
// api
import { addMarketOrder } from '@/api/trade.js'

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
            // 数量
            count: '',
            // 按钮选项
            tabs: [
                { title: this.$t('trade.allPosition'), value: 1, divValue: 1 },
                { title: '1/2', value: 2, divValue: 2 },
                { title: '1/3', value: 3, divValue: 3 },
                { title: '1/4', value: 4, divValue: 4 }
            ],
            // 当前选项卡
            currentValue: '',
            // 手数小数位
            volumeDigit: ''
        }
    },
    computed: {
        ...mapGetters(['style']),
        // 持有
        positionVolume () {
            return Number(minus(this.data.openVolume, this.data.closeVolume))
        },
        // 账户
        account () {
            return this.customerInfo?.accountList.find(item => Number(item.tradeType) === Number(this.data.tradeType))
        },
        // 检测平仓手数是否合法
        closeVolumeWarn () {
            const minVolume = this.product?.minVolume ?? 0
            const closeVolume = this.count
            const mod = BigNumber(closeVolume).mod(minVolume).toNumber()
            if (eq(closeVolume, this.positionVolume)) {
                return false
            } else if (lt(closeVolume, minVolume) || gt(closeVolume, this.positionVolume)) {
                return this.$t('trade.volumesOutScope', { min: minVolume, max: this.positionVolume, volumeUnit: this.$t('trade.volumeUnit') })
            } else if (mod > 0) {
                return this.$t('trade.volumesOutScopeTip', { volume: minVolume })
            } else {
                return false
            }
        }
    },
    watch: {
        // 监听positionVolume
        positionVolume () {
            this.count = this.positionVolume
        },
        // 监听count
        // count () {
        //     this.currentValue = ''
        //     this.tabs.map(elem => {
        //         const num = divide(this.positionVolume, elem.divValue)
        //         if (Number(num) === Number(this.count)) {
        //             this.currentValue = elem.value
        //         }
        //     })
        // }
    },
    methods: {
        // 打开弹窗
        open () {
            this.count = this.positionVolume
            this.volumeDigit = getDecimalNum(this.product.minVolume)
            this.show = true
        },

        // 关闭弹窗
        close () {
            this.show = false
        },
		
        // 更新输入数量
        updateCount () {
            this.currentValue = ''
        },

        // 快速设置平仓手数
        volumeHandler (item) {
            const minVolume = this.product.minVolume
            const volumeStep = this.product.volumeStep
            const volumeDigit = getDecimalNum(this.product.minVolume)
            this.currentValue = item.value
            if (BigNumber(this.positionVolume).lte(minVolume)) {
                this.count = minVolume
            } else {
                const newVolume = toFixed(volumeStep * Math.round((this.positionVolume / volumeStep) / parseFloat(item.divValue)), volumeDigit)
                this.count = newVolume
            }
        },

        // 平仓接口参数
        submitCloseParam () {
            if (!this.count) {
                uni.showToast({
                    title: this.$t('trade.inputCloseNum'),
                    icon: 'none'
                })
                return
            }
            if (this.closeVolumeWarn) {
                uni.showToast({
                    title: this.closeVolumeWarn,
                    icon: 'none'
                })
                return
            }
            const data = this.data
            const product = this.product
            const account = this.account
            const requestPrice = data.direction === 1 ? product.sell_price : product.buy_price
            const direction = data.direction === 1 ? 2 : 1
            const p = pow(10, product.price_digits)
            const params = {
                bizType: 2, // 业务类型。0-默认初始值；1-市价开；2-市价平；3-止损平仓单；4-止盈平仓单；5-爆仓强平单；6-到期平仓单；7-销户平仓单；8-手动强平单；9-延时订单；10-限价预埋单；11-停损预埋单；
                direction, // 订单买卖方向。1-买；2-卖；
                positionId: data.positionId,
                symbolId: product.symbolId,
                requestTime: Date.now(),
                requestNum: this.count,
                requestPrice: mul(requestPrice, p),
                expireType: data.expireType,
                stopLoss: data.stopLoss,
                takeProfit: data.takeProfit,
                tradeType: data.tradeType,
                accountId: account.accountId,
                accountCurrency: account.currency,
                accountDigits: account.digits
            }
            return params
        },

        // 获取持仓列表
        queryPositionList () {
            const data = this.data
            const accountId = this.customerInfo?.accountList.find(item => Number(item.tradeType) === Number(data.tradeType))?.accountId
            store.dispatch('_trade/queryPositionPage', {
                tradeType: data.tradeType,
                sortFieldName: 'openTime',
                sortType: 'desc',
                accountId
            })
        },

        // 确认平仓
        submitCloseHandler () {
            const params = this.submitCloseParam()
            if (!params) return
            uni.showLoading({
                title: this.$t('common.submiting'),
                mask: true
            })
            addMarketOrder(params).then(res => {
                uni.hideLoading()
                this.close()
                uni.showToast({
                    title: this.$t('trade.closeSuccessToast'),
                    icon: 'none'
                })
                this.queryPositionList()
            }).catch(res => {
                uni.hideLoading()
                this.$refs['modalDialog'].show({
                    content: res.msg
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.close-position  {
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
		.hold {
			@include flexAlign;
			margin-bottom: 30rpx;
			b {
				display: inline-flex;
				justify-content: center;
				align-items: center;
				height: 36rpx;
				padding: 0 8rpx;
				margin-right: 10rpx;
				color: #fff !important;
				font-size: 26rpx;
				border-radius: 6rpx;
				&.riseColor {
					@include styles('background', 'riseColor');
				}
				&.fallColor {
					@include styles('background', 'fallColor');
				}
			}
			span {
				@include styles('color', 'color');
				font-size: 30rpx;
			}
		}
		.row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 50rpx;
			font-size: 24rpx;
			.col {
				display: inline-flex;
				flex-direction: column;
				.name {
					@include styles('color', 'minorColor');
				}
				.value {
					@include styles('color', 'color');
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
			.title {
				@include styles('color', 'minorColor');
				font-size: 28rpx;
			}
		}
		.tabs {
			@include flexEndAlign;
			margin-top: 40rpx;
			.item {
				@include flexAll;
				@include styles('color', 'color');
				@include styles('background-color', 'assistColor');
				width: 120rpx;
				height: 50rpx;
				margin-left: 20rpx;
				font-size: 26rpx;
				border-radius: 4rpx;
				&.item-active {
					@include styles('background-color', 'primary');
					color: #fff !important;
				}
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

<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom>
                <view class='hedaer-title'>
                    {{ product.symbolName }}
                </view>
                <view class='header-icon'>
                    <i class='iconfont icon_tubiao' @click='$method.goChartPage(product)'></i>
                </view>
            </nav-bar>
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module module-1'>
                    <view class='label'>
                        {{ $t('trade.profit') }}({{ assetsInfo.currency }})
                    </view>
                    <view class='stop-loss' :class="Number(positionData.profitLoss) === 0 ? '' : (Number(positionData.profitLoss) > 0 ? 'riseColor': 'fallColor')">
                        {{ positionData.profitLoss || '--' }}
                    </view>
                    <view v-if='Number(positionData.tradeType) === 2' class='item'>
                        <view class='label'>
                            {{ $t('trade.swap_2') }}({{ assetsInfo.currency }})
                        </view>
                        <view class='value'>
                            {{ positionData.interest || '--' }}
                        </view>
                    </view>
                    <view class='handle'>
                        <button class='btn' @click='openProfit'>
                            {{ $t('trade.tackStopSetup') }}
                        </button>
                        <button class='btn' @click='openPosition'>
                            {{ $t('trade.closeOrder') }}
                        </button>
                    </view>
                </view>
                <view class='module module-2'>
                    <view class='header'>
                        <b :class="Number(positionData.direction) === 1 ? 'riseColor' : 'fallColor'">
                            {{ Number(positionData.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                        </b>
                        <strong>
                            {{ positionVolume }} {{ $t('trade.volumeUnit') }}
                        </strong>
                    </view>
                    <view class='row'>
                        <view class='col'>
                            <span>{{ $t('trade.positionPrice') }}</span>
                            <strong>{{ positionData.openPrice }}</strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('trade.currentPrice') }}</span>
                            <strong :class='[Number(positionData.direction) === 1 ? product.sell_color : product.buy_color]'>
                                {{ Number(positionData.direction) === 1 ? product.sell_price : product.buy_price }}
                            </strong>
                        </view>
                    </view>
                    <view class='row'> 
                        <view class='col'>
                            <span>{{ $t('trade.stopLossPrice') }}</span> 
                            <span v-if='!parseFloat(positionData.stopLossDecimal)'>
                                {{ $t('trade.nosSet') }}
                            </span>
                            <strong v-else>
                                {{ parseFloat(positionData.stopLossDecimal) }}
                            </strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('trade.stopProfitPrice') }}</span>
                            <span v-if='!parseFloat(positionData.takeProfitDecimal)'>
                                {{ $t('trade.nosSet') }}
                            </span>
                            <strong v-else>
                                {{ parseFloat(positionData.takeProfitDecimal) }}
                            </strong>
                        </view>
                    </view>
                    <view class='row'>
                        <view class='col'>
                            <span>{{ $t('trade.openTime') }}</span>
                            <strong>{{ formatTime(positionData.openTime) }}</strong>
                        </view>
                        <view class='col'>
                            <span>{{ $t('trade.positionId') }}</span>
                            <strong>ID : {{ positionId }}</strong>
                        </view>
                    </view>
                </view>
            </view>
        </view>
		
        <!-- 止盈止损组件 -->
        <stop-profit ref='stopProfit' :data='positionData' :product='product' />
        <!-- 平仓组件 -->
        <close-position ref='closePosition' :data='positionData' :product='product' />
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// components
import stopProfit from './components/stop-profit.vue'
import closePosition from './components/close-position.vue'
// calculation
import { minus } from '@/utils/calculation.js'

export default {
    components: {
        stopProfit,
        closePosition
    },
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // tradeType
            tradeType: '',
            // symbolId
            symbolId: '',
            // positionId
            positionId: ''
        }
    },
    computed: {
        positionMap () {
            return store.state._trade.positionMap || {}
        },
        productMap () {
            return store.state._quote.productMap || {}
        },
        positionData () {
            return this.positionMap[this.positionId + '_' + this.tradeType] || {}
        },
        positionVolume () {
            return minus(this.positionData?.openVolume, this.positionData?.closeVolume) 
        },
        product () {
            return this.productMap[this.symbolId + '_' + this.tradeType] || {}
        },
        assetsInfo () {
            return this.customerInfo.accountList?.find(el => Number(el.tradeType) === Number(this.tradeType)) || {}
        }
    },
    onLoad (options) {
        this.tradeType = options.tradeType
        this.symbolId = options.symbolId
        this.positionId = options.positionId
       
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('position_detail_view')
    },
    onUnload () {
        // 取消订阅
        this.$QuoteSocket.cancel_subscribe()
        this.$MsgSocket.cancelSubscribeAsset()
    },
    methods: {
        // 页面数据初始化
        pageInit () {
            const symbolKey = this.symbolId + '_' + this.tradeType 
            // 获取产品详情
            store.commit('_quote/Update_productActivedID', symbolKey)
            store.dispatch('_quote/querySymbolInfo', {
                symbolId: this.symbolId,
                tradeType: this.tradeType
            })
            // 订阅报价
            this.$QuoteSocket.send_subscribe([symbolKey])
            // 发起消息订阅
            this.$MsgSocket.subscribedListAdd(() => {
                this.$MsgSocket.subscribeAsset(this.tradeType)
            })
            if (this.positionId && !this.positionData.positionId) {
                store.dispatch('_trade/queryPositionPage', {
                    tradeType: this.tradeType,
                    accountId: this.assetsInfo.accountId
                })
            }
        },
		
        // 打开止盈止损组件
        openProfit () {
            this.$refs['stopProfit'].open() 
        },
			
        // 打开平仓组件
        openPosition () {
            this.$refs['closePosition'].open()
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep {
	.nav-title-bar {
		@include styles('background', 'bgColor');
	}
}
.hedaer-title {
	@include styles('color', 'color');
	font-size: 45rpx;
	font-weight: bold;
}
.header-icon {
	display: flex;
	align-items: center;
	height: 100%;
	position: absolute;
	top: 0;
	right: 30rpx;
	i {
		font-size: 30rpx;
	}
}
.layout-content {
	padding: 20rpx; 
}
.module {
	@include styles('background-color', 'contentColor');
	margin-bottom: 20rpx;
	border-radius: 6rpx;
}
.module-1 {
	padding: 30rpx;
	.label {
		@include styles('color', 'minorColor');
	}
	.stop-loss {
		font-size: 70rpx;
	}
	.item {
		margin-top: 40rpx;
	}
	.value {
		@include styles('color', 'color');
		font-size: 34rpx;
	}
	.handle {
		@include flexBetween;
		margin-top: 50rpx;
		.btn {
			@include flexAll;
			@include styles('color', 'primary');
			@include styles('background', 'primaryAssistColor');
			flex: 1;
			height: 56rpx;
			margin-right: 25rpx;
			font-size: 28rpx;
			border-radius: 6rpx;
			&:last-child {
				margin-right: 0;
			}
		}
	}
}
.module-2 {
	.header {
		@include styles('border-bottom-color', 'lineColor');
		padding: 30rpx;
		border-bottom-style: solid;
		border-bottom-width: 1rpx;
		b {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			height: 36rpx;
			line-height: 1;
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
		strong {
			font-size: 30rpx;
		}
	}
	.row {
		@include flexBetween;
		@include styles('border-bottom-color', 'lineColor');
		border-bottom-width: 1rpx;
		border-bottom-style: solid;
		padding: 30rpx;
		font-size: 30rpx;
		&:last-of-type {
			border-bottom: none;
		}
		.col {
			@include flexColumn;
			&:last-of-type {
				text-align: right;
			}
			span {
				@include styles('color', 'minorColor');
				margin-bottom: 5rpx;
			}
		}
	}
}
</style>

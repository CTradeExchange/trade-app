<template>
    <view class='layout' :change-color='changeColor' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('trade.trustDetail')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='module module-1'>
                    <view class='above'>
                        <view class='name'>
                            <span :class="Number(pendingItem.direction) === 1 ? 'riseColor' : 'fallColor'">
                                {{ Number(pendingItem.direction) === 1 ? $t('trade.buy') : $t('trade.sell') }}
                            </span>
                            <strong>{{ pendingItem.symbolName }}</strong>
                        </view>
                        <etf-icon v-if='product.etf' />
                    </view>
                    <view class='row'>
                        <view class='col'>
                            <span v-if='Number(pendingItem.tradeType) === 5'>
                                {{ Number(pendingItem.direction) === 1 ? $t('trade.pendingAmount') + ' ('+ pendingItem.outCurrency +')' : $t('trade.pendingUnit') + ' ('+ pendingItem.outCurrency +')' }}
                            </span>
                            <span v-else-if='Number(pendingItem.tradeType) === 1'>
                                {{ $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' }}
                            </span>
                            <span v-else-if='Number(pendingItem.tradeType) === 3'>
                                {{ Number(pendingItem.entryType) === 1 ? $t('trade.pendingUnit')+ ' (' +pendingItem.accountCurrency + ')' : $t('trade.pendingAmount') + ' ('+pendingItem.accountCurrency + ')' }}
                            </span>
                            <span v-else>
                                {{ Number(pendingItem.entryType) === 1 ? $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' : $t('trade.pendingAmount') + ' ('+pendingItem.accountCurrency + ')' }}
                            </span>
                            <strong>
                                {{ pendingItem.requestNum }} {{ Number(pendingItem.entryType) === 1 ? $t('trade.volumeUnit') : pendingItem.accountCurrency }}
                            </strong>
                        </view>
                        <view class='col'>
                            <span>
                                {{ $t('trade.trustPrice') }}
                            </span>
                            <strong>
                                {{ pendingItem.requestPrice || '--' }}
                            </strong>
                        </view>
                        <view class='col'>
                            <span>
                                {{ $t('trade.currentPrice') }}
                            </span>
                            <strong :class='Number(pendingItem.direction) === 1 ? product.buy_color : product.sell_color'>
                                {{ Number(pendingItem.direction) === 1 ? product.buy_price : product.sell_price }}
                            </strong>
                        </view>
                    </view>
                    <view class='row'>
                        <template v-if='$includePlay_1(tradeType)'>
                            <view class='col'>
                                <span>{{ $t('trade.stopLossPrice') }}</span>
                                <strong>{{ shiftedBy(pendingItem.stopLoss, -1 * pendingItem.digits ) || '--' }}</strong>
                            </view>
                            <view class='col'>
                                <span>{{ $t('trade.stopProfitPrice') }}</span>
                                <strong>{{ shiftedBy(pendingItem.takeProfit, -1 * pendingItem.digits ) || '--' }}</strong>
                            </view>
                        </template>
                        <view v-if='[3, 9].includes(Number(tradeType))' class='col'>
                            <span>{{ $t('trade.loan')+ '(' + pendingItem.accountCurrency + ')' }}</span>
                            <strong>{{ pendingItem.loanAmount ? pendingItem.loanAmount + ' ' + pendingItem.accountCurrency : '--' }}</strong>
                        </view>
                    </view>
                </view>
                <view class='module module-2'>
                    <view v-if='$includePlay_1(tradeType)' class='row'>
                        <span>{{ $t('trade.expireTime') }}</span>
                        <strong>
                            {{ $t( pendingItem.expireType === 1 ? 'trade.expireType1' : 'trade.expireType2') }}
                        </strong>
                    </view>
                    <view class='row'>
                        <span>{{ $t('trade.pendingTime') }}</span>
                        <strong>{{ formatTime(pendingItem.orderTime) }}</strong>
                    </view>
                    <view class='row'>
                        <span>{{ $t('trade.pendingNo') }}</span>
                        <strong>ID : {{ Number(pendingItem.tradeType) === 3 ? pendingItem.orderId : pendingItem.id }}</strong>
                    </view>
                </view>
            </view>
            <!-- 底部按钮 -->
            <button class='footer-button' @click.stop='cancelOrder'>
                {{ $t('trade.cancelOrder') }}
            </button>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// utils
import { shiftedBy } from '@/utils/calculation.js'	
// api
import { closePboOrder, closeTradePboOrder } from '@/api/trade.js'
	
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // id
            id: '',
            // symbolId
            symbolId: '',
            // tradeType
            tradeType: ''
        }
    },
    computed: {
        // 持仓map数据
        pendingMap () {
            return store.state._trade.pendingMap || {}
        },
        // 产品map数据
        productMap () {
            return store.state._quote.productMap || {}
        },
        // 持仓详情数据
        pendingItem () {
            return this.pendingMap[`${this.id}_${this.tradeType}`] || {}
        },
        // 产品数据
        product () {
            return this.productMap[`${this.symbolId}_${this.tradeType}`] || {}
        }
    },
    onLoad (options) {
        this.id = options.id
        this.symbolId = options.symbolId
        this.tradeType = options.tradeType
		
        // 初始化
        this.$init().then(() => {
            this.skeletonShow = false
            this.pageInit()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('trust_detail_view')
    },
    methods: {
        shiftedBy,
		
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
            // 获取委托列表数据
            this.getTrustList()
        },
		
        // 获取委托列表数据
        getTrustList () {
            store.dispatch('_trade/queryPBOOrderPage', {
                tradeType: this.tradeType,
                customerNo: this.customerInfo.customerNo,
                sortFieldName: 'orderTime',
                sortType: 'desc'
            })
        },  
		
        // 撤单
        cancelOrder () {
            this.$refs['modalDialog'].show({
                content: this.$t('trade.cancelPendingOrder'),
                showCancel: true
            }).then(() => {
                const data = this.pendingItem
                const params = {
                    tradeType: data.tradeType,
                    customerNo: this.customerInfo.customerNo,
                    accountId: data.accountId,
                    bizType: data.bizType
                }
                if ([5, 9].includes(data.tradeType)) {
                    params.orderId = data.id
                    closeTradePboOrder(params).then(() => {
                        this.successCallBack()
                    }).catch(res => {
                        this.$refs['modalDialog'].show({
                            content: res.msg
                        })
                    })
                } else {
                    params.pboId = data.id.toString()
                    closePboOrder(params).then(() => {
                        this.successCallBack()
                    }).catch(res => {
                        this.$refs['modalDialog'].show({
                            content: res.msg
                        })
                    })
                }
            }).catch(() => {})
        },
        
        // 撤单成功
        successCallBack () {
            uni.showToast({
                title: this.$t('trade.cancelSuccess'),
                icon: 'none'
            })
            this.getTrustList()
            setTimeout(() => {
                uni.navigateBack({
                    delta: 1
                })
            }, 1500)   
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content {
	padding: 20rpx;
}
.module {
	@include styles('background-color', 'contentColor');
	margin-bottom: 20rpx;
	border-radius: 15rpx;
}
.module-1 {
	padding: 30rpx;
	.above {
		@include flexAlign;
		.name {
			font-size: 28rpx;
			span {
				margin-right: 12rpx;
			}
			strong {
				margin-right: 15rpx;
			}
		}
		.code {
			@include styles('color', 'minorColor');
			margin-top: 5rpx;
			font-size: 24rpx;
		}
	}
	.row {
		@include flexBetween;
		@include styles('color', 'color');
		margin-top: 40rpx;
		font-size: 26rpx;
		.col {
			@include flexColumn;
			&:last-child {
				text-align: right;
			}
			&:first-child {
				text-align: left;
			}
			span {
				@include styles('color', 'minorColor');
			}
			strong {
				margin-top: 5rpx;
			}
		}
	}
}
.module-2 {
	.row {
		@include flexBetween;
		@include styles('border-bottom-color', 'lineColor');
		border-bottom-width: 1rpx;
		border-bottom-style: solid;
		padding: 30rpx;
		font-size: 28rpx;
		&:last-of-type {
			border-bottom: none;
		}
		span {
			@include styles('color', 'minorColor');
		}
	}
}		
.footer-button {
	@include flexAll;
	@include styles('background-color', 'primary');
	height: 90rpx;
	font-size: 28rpx;
	color: #fff;
}
</style>

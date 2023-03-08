<template>
    <view class='trust-item'>
        <view class='header-row'>
            <view class='label'>
                <view :class="Number(data.direction) === 1 ? 'riseColor' : 'fallColor'">
                    {{ Number(data.direction) === 1 ? $t('trade.buy') :$t('trade.sell') }}
                </view> 
                <view class='name'>
                    {{ data.symbolName }}
                </view>
                <etf-icon v-if='product.etf' />
                <span v-if='data.crossLevelNum' class='crossLevelNum'>
                    {{ data.crossLevelNum }}x
                </span>
            </view>
            <button class='btn' @click.stop='cancelOrder'>
                {{ $t('trade.cancelOrder') }}
            </button>
        </view>
        <view class='detail' @click.stop='goTrustDetail'>
            <view class='block'>
                <view class='row'>
                    <span v-if='[5, 9].includes(Number(data.tradeType))'>
                        {{ Number(data.direction) === 1 ? $t('trade.pendingAmount') + ' ('+ data.outCurrency +')' : $t('trade.pendingUnit') + ' ('+ data.outCurrency +')' }}
                    </span>
                    <span v-else-if='Number(data.tradeType) === 1'>
                        {{ $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' }}
                    </span>
                    <span v-else-if='Number(data.tradeType) === 3'>
                        {{ Number(data.entryType) === 1 ? $t('trade.pendingUnit')+ ' ('+data.accountCurrency + ')' : $t('trade.pendingAmount') + ' ('+data.accountCurrency + ')' }}
                    </span>
                    <span v-else>
                        {{ Number(data.entryType) === 1 ? $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' : $t('trade.pendingAmount') + ' ('+data.accountCurrency + ')' }}
                    </span>
                    <strong>{{ data.requestNum }}</strong>
                </view>
                <view v-if='data.expireType' class='row'>
                    <span>
                        {{ $t('trade.expire') }}
                    </span>
                    <strong>
                        {{ expireTypeMap[data.expireType] }}
                    </strong>
                </view>
                <view v-if='[3, 9].includes(Number(data.tradeType))' class='row'>
                    <span>
                        {{ $t('trade.loan') }} ({{ Number(data.tradeType) === 3 ? data.accountCurrency : data.outCurrency }})
                    </span>
                    <strong>
                        {{ data.loanAmount || '--' }}
                    </strong>
                </view>
                <view v-if='Number(data.tradeType) === 5' class='row'>
                    <span>
                        {{ $t('trade.orderComplete')+'('+ data.outCurrency +')' }}
                    </span>
                    <strong>
                        {{ data.executeNum }}
                    </strong>
                </view>
                <view class='row'>
                    <span>
                        {{ $t('trade.trustPrice') }}
                    </span>
                    <strong>
                        {{ data.requestPrice }}
                    </strong>
                </view>
                <view class='row'>
                    <span>{{ $t('trade.currentPrice') }}</span>
                    <strong :class='[Number(data.direction) === 1 ? product.buy_color : product.sell_color]'>
                        {{ Number(data.direction) === 1 ? product.buy_price : product.sell_price }}
                    </strong>
                </view>
                <template v-if='[1, 2].includes(Number(data.tradeType))'>
                    <view class='row'>
                        <span>
                            {{ $t('trade.stopLossPrice') }}
                        </span>
                        <strong>
                            {{ shiftedBy(data.stopLoss,-1 * data.digits ) || '--' }}
                        </strong>
                    </view>
                    <view class='row'>
                        <span>
                            {{ $t('trade.stopProfitPrice') }}
                        </span>
                        <strong>
                            {{ shiftedBy(data.takeProfit, -1 * data.digits ) || '--' }}
                        </strong>
                    </view>
                </template>
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
// calculation
import { shiftedBy } from '@/utils/calculation.js'
// api
import { closePboOrder, closeTradePboOrder } from '@/api/trade.js'
	
export default {
    props: {
        // 单项数据
        data: {
            type: [Object, null],
            default: () => null
        }
    },
    data () {
        return {
            // 有效期
            expireTypeMap: {
                1: this.$t('trade.expire1'),
                2: this.$t('trade.expire2')
            }
        }
    },
    computed: {
        // 产品map数据
        productMap () {
            return store.state._quote.productMap
        },
        // 当前产品数据
        product () {
            const data = this.data
            const symbolKey = `${data.symbolId}_${data.tradeType}`
            return this.productMap[symbolKey] || {}
        }
    }, 
    methods: {
        shiftedBy,
		
        // 跳转到委托详情页面
        goTrustDetail () {
            const data = this.data
            const param = `id=${data.id}&symbolId=${data.symbolId}&tradeType=${data.tradeType}`
            uni.navigateTo({
                url: '/pages/order/trustDetail?' + param
            })
        },
		
        // 获取委托列表数据
        getTrustList () {
            store.dispatch('_trade/queryPBOOrderPage', {
                tradeType: this.data.tradeType,
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
                const data = this.data
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
        }
    }
}
</script>

<style lang="scss" scoped>
.trust-item {
	@include styles('background-color', 'contentColor');
	padding: 30rpx 20rpx;
	margin-top: 20rpx;
	border-radius: 6rpx;
	&:last-of-type {
		border: none;
	}
	.header-row {
		@include flexBetweenAlign;
		.label {
			@include flexAlign;
			font-size: 30rpx;
			.name {
				margin-left: 18rpx;
				margin-right: 15rpx;
			}
			.crossLevelNum {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 64rpx;
				height: 32rpx;
				font-size: 24rpx;
				border-radius: 6rpx;
				border-width: 1px;
				border-style: solid;
				@include styles('border-color', 'color');
				@include styles('color', 'color');
			}
		}
		.btn {
			@include flexAll;
			@include styles('color', 'primary');
			@include styles('background-color', 'primaryAssistColor');
			width: 124rpx;
			height: 48rpx;
			font-size: 24rpx;
			border-radius: 6rpx;
		}
	}
	.detail {
		@include styles('color', 'normalColor');
		margin-top: 20rpx;
		font-size: 24rpx;
		.block {
			@include flexAlign;
			flex-wrap: wrap;
			&:last-of-type {
				margin-bottom: 0;
			}
			.row {
				@include styles('color', 'color');
				@include flexColumn;
				width: 50%;
				margin-top: 18rpx;
				&:nth-child(2n) {
					text-align: right;
				}
				span {
					@include styles('color', 'minorColor');
					font-size: 24rpx;
				}
				strong {
					margin-top: 5rpx;
					font-size: 28rpx;
				}
			}
		}
	}
}
</style>

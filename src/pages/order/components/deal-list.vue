<template>
    <view class='deal-list'>
        <block v-for='(item, index) in list' :key='index'>
            <view class='item'>
                <view class='header-row'>
                    <view class='label'>
                        <span :class="Number(item.direction) === 1 ? 'riseColor' : 'fallColor'">
                            {{ Number(item.direction) === 1 ? $t('trade.buy') :$t('trade.sell') }}
                        </span> 
                        <strong>
                            {{ item.symbolName }}
                        </strong>
                        <etf-icon v-if="productMap[item.symbolId + '_' + tradeType] ? productMap[item.symbolId + '_' + tradeType]['etf'] : false" />
                    </view>
                    <view class='type'>
                        {{ bizTypeText ? bizTypeText[item.bizType] : '--' }}
                    </view>
                </view>
                <view class='detail'>
                    <view class='box'>
                        <view class='row'>
                            <span v-if='$includePlay_2(tradeType)'>
                                {{ Number(item.direction) === 1 ? $t('trade.pendingAmount') + '('+item.outCurrency + ')' : $t('trade.pendingUnit')+ '(' +item.outCurrency + ')' }}
                            </span>
                            <span v-else-if='Number(tradeType) === 1'>
                                {{ $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' }}
                            </span>
                            <span v-else>
                                {{ Number(item.numberStatisticMode) === 1 ? $t('trade.pendingUnit')+ '(' +$t('trade.volumeUnit') + ')' : $t('trade.pendingAmount') + ' ('+item.accountCurrency + ')' }}
                            </span>
                            <strong>{{ item.requestNum || '--' }}</strong>
                        </view>
                        <view class='row'>
                            <span v-if='$includePlay_1(tradeType)'>
                                {{ $t('trade.dealVolume') }}({{ $t('trade.volumeUnit') }})
                            </span>
                            <span v-if='$includePlay_2(tradeType)'>
                                {{ Number(item.direction) === 1 ? $t('trade.orderAmount') : $t('trade.dealVolume') }}({{ item.outCurrency }})
                            </span>
                            <strong>{{ item.executeNum || '--' }}</strong>
                        </view>
                        <view v-if='isCloseType(item.bizType)' class='row'>
                            <span>{{ $t('trade.positionPrice') }}</span>
                            <strong>{{ item.requestPrice || '--' }}</strong>
                        </view>
                        <view v-else-if='Number(item.bizType) === 1 || Number(item.bizType) === 12' class='row'>
                            <span>{{ $t('trade.trustPrice') }}</span>
                            <strong>--</strong>
                        </view>
                        <view v-else class='row'>
                            <span>{{ $t('trade.trustPrice') }}</span>
                            <strong>{{ item.requestPrice || '--' }}</strong>
                        </view>
                        <view class='row'>
                            <span>{{ $t('trade.dealAvgPrice') }}</span>
                            <strong>{{ item.executePrice }}</strong>
                        </view>
                        <view v-if='showLossOrProfit(item)' class='row'>
                            <span>
                                {{ $t('trade.stopLossPrice') }}
                            </span>
                            <strong>
                                {{ parseFloat(item.stopLoss) > 0 ? item.stopLoss : '--' }}
                            </strong>
                        </view>
                        <view v-if='showLossOrProfit(item)' class='row'>
                            <span>
                                {{ $t('trade.stopProfitPrice') }}
                            </span>
                            <strong>
                                {{ parseFloat(item.takeProfit) > 0 ? item.takeProfit : '--' }}
                            </strong>
                        </view>
                        <view v-if='isCloseType(item.bizType)' class='row'>
                            <span>
                                {{ $t('trade.profit') }}
                            </span>
                            <strong>
                                {{ item.profitLoss || '--' }}
                            </strong>
                        </view>
                        <view v-if='[3, 9].includes(Number(tradeType))' class='row'>
                            <span>
                                {{ $t('trade.loan') }}({{ item.outCurrency }})
                            </span>
                            <strong>
                                {{ item.loanAmount || '--' }}
                            </strong>
                        </view>
                        <view class='row'>
                            <span v-if='[3, 5].includes(Number(tradeType))'>
                                {{ $t('fee') }}({{ item.inCurrency || '--' }})
                            </span>
                            <span v-else>
                                {{ $t('fee') }}
                            </span>
                            <strong>
                                {{ item.commission || '--' }}
                            </strong>
                        </view>
                        <view v-if='Number(tradeType) === 2 && isCloseType(item.bizType)' class='row'>
                            <span>
                                {{ $t('trade.swap') }}
                            </span>
                            <strong>
                                {{ item.overnightInterest || '--' }}
                            </strong>
                        </view>
                    </view>
                    <view class='box'>
                        <view class='row'>
                            <span>{{ formatTime(item.executeTime, 'YYYY/MM/DD HH:mm:ss') }}</span>
                        </view>
                        <view class='row'>
                            <span>#{{ item.dealId }}</span>
                        </view>
                    </view>
                </view>
            </view>
        </block>
    </view>
</template>

<script>	
import store from '@/store'

export default {
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        }, 
        // 分类数据
        bizTypeText: {
            type: Object,
            default: () => {}
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        }
    },
    computed: {
        // productMap数据
        productMap () { 
            return store.state._quote.productMap || {}
        }
    },
    methods: {
        // 判断是否是平仓
        isCloseType (bizType) {
            return [4, 5, 6, 7, 8].includes(Number(bizType))
        },
		
        // 是否显示止盈止损
        showLossOrProfit (item) {
            // 玩法cfd全仓和cfd逐仓才显示止盈止损价
            if (this.$includePlay_1(this.tradeType) && !this.isCloseType(item.bizType)) {
                return true
            } else {
                return false
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.deal-list {
	padding: 0 20rpx;
	.item {
		@include styles('background-color', 'contentColor');
		padding: 30rpx 20rpx;
		margin-top: 20rpx;
		border-radius: 6rpx;
		.header-row {
			@include flexBetweenAlign;
			.label {
				@include flexAlign;
				font-size: 30rpx;
				span {
					margin-right: 15rpx;
				}
				strong {
					margin-right: 15rpx;
				}
			}
			.type {
				font-size: 26rpx;
			}
		}
		.detail {
			@include styles('color', 'normalColor');
			margin-top: 20rpx;
			font-size: 24rpx;
			.box {
				@include flex;
				justify-content: space-between;
				flex-wrap: wrap;
				.row {
					@include flexBetweenAlign;
					width: 47%;
					margin-top: 10rpx;
					span {
						@include styles('color', 'minorColor');
					}
					strong {
						@include styles('color', 'color');
					}
				}
			}
		}
	}
}
</style>

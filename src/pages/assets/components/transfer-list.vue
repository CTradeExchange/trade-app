<template>
    <view class='transfer-list'>
        <block v-for='(item, index) in list' :key='index'>
            <view class='item'>
                <view class='row'>
                    <span class='currency'>
                        {{ item.outCurrencyCode }}
                    </span>
                    <strong class='amount'>
                        {{ item.outAmount }}
                    </strong>
                </view>
                <view class='time'>
                    {{ formatTime(item.createTime) }}
                </view>
                <view class='block'>
                    <view class='col'>
                        <span>{{ $t('tradeType['+ tradeType + ']') }}</span>
                        <em>-</em>
                        <strong>{{ directionText(item, 1) }}</strong>
                    </view>
                    <view class='col'>
                        <span>{{ $t('tradeType['+ item.rightTradeType +']') }}</span>
                        <em>-</em>
                        <strong>{{ directionText(item, 2) }}</strong>
                    </view>
                </view>
            </view>
        </block>
    </view>
</template>

<script>
// vuex
import store from '@/store/index.js'
		
export default {
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 玩法类型
        tradeType: {
            type: [String, Number],
            default: ''
        }
    },
    computed: {
        // 玩法map数据
        planMap () {
            return store.state._quote.planMap
        }
    },
    methods: {
        // 转入、转出方案处理
        directionText (item, type) {
            const key = Number(item.inTradeType) === Number(this.tradeType) ? 'inTradeType' : 'outTradeType'
            if (key === 'inTradeType') {
                item.rightTradeType = item.outTradeType
                return type === 1 ? this.$t('assets.toAccount') : this.$t('assets.fromAccount')
            } else {
                item.rightTradeType = item.inTradeType
                return type === 1 ? this.$t('assets.fromAccount') : this.$t('assets.toAccount')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.transfer-list {
	padding: 20rpx 30rpx 0;
	.item {
		@include styles('background-color', 'contentColor');
		margin-bottom: 20rpx;
		padding: 30rpx;
		border-radius: 10rpx;
		&:last-of-type {
			margin-bottom: 0;
		}
		.row {
			@include flexBetweenAlign;
			.currency {
				font-size: 30rpx;
			}
			.amount {
				font-size: 34rpx;
			}
		}
		.time {
			@include styles('color', 'minorColor');
			margin-top: 10rpx;
			font-size: 24rpx;
		}
		.block {
			@include flexBetween;
			margin-top: 30rpx;
			.col {
				@include styles('color', 'color');
				font-size: 24rpx;
				&:last-of-type {
					text-align: right;
				}
				em {
					margin: 0 8rpx;
				}
			}
		}
	}
}
</style>

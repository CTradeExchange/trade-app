<template>
    <view class='flow-list'>
        <block v-for='(item, index) in list' :key='index'>
            <view class='item'>
                <view class='row'>
                    <span class='currency'>
                        {{ item.currency }}
                    </span>
                    <strong class='amount'>
                        {{ item.amount > 0 ? '+ '+item.amount : '- '+ Math.abs(item.amount) }}
                    </strong>
                </view>
                <view class='row-2'>
                    <span>{{ item.businessType1Name }}</span>
                    <strong>{{ $t('common.balance') }} {{ item.amountAfter }}</strong>
                </view>
                <view class='time'>
                    {{ formatTime(item.createTime) }}
                </view>
            </view>
        </block>
    </view>
</template>

<script>	
export default {
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        }
    },
    data () {
        return {
            flowSubCategory: {}
        }
    },
    mounted () {
        this.flowSubCategory = this.$t(`fund.flowSubCategory.${this.tradeType}`)
    }
}
</script>

<style lang="scss" scoped>
.flow-list {
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
		.row-2 {
			@include flexBetweenAlign;
			margin-top: 10rpx;
			font-size: 24rpx;
		}
		.time {
			@include styles('color', 'minorColor');
			margin-top: 15rpx;
			font-size: 24rpx;
		}
	}
}
</style>

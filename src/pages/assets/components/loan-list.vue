<template>
    <view class='loan-list'>
        <block v-for='(item, index) in list' :key='index'>
            <view class='item'>
                <view class='row'>
                    <span class='currency'>
                        {{ item.currency }}
                    </span>
                    <strong class='amount'>
                        {{ item.liabilities }}
                    </strong>
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
        }
    },
    data () {
        return {
			
        }
    }
}
</script>

<style lang="scss" scoped>
.loan-list {
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
			margin-top: 15rpx;
			font-size: 24rpx;
		}
	}
}
</style>

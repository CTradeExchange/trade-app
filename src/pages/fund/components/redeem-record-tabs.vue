<template>
    <view class='tabs'>
        <view class='box'>
            <view :class="{ 'li': true, 'active': current === 0 }" @click='switchTab(0)'>
                {{ $t('fundInfo.curRedeem') }}
            </view>
            <view :class="{ 'li': true, 'active': current === 1 }" @click='switchTab(1)'>
                {{ $t('fundInfo.historyRedeem') }}
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 当前选项 0:当前赎回 1:历史赎回
        current: {
            type: Number,
            default: 0
        }
    },
    methods: {
        // 切换选项卡
        switchTab (index) {
            if (this.current !== index) {
                this.$emit('update:current', index)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.tabs {
	display: flex;
	justify-content: center;
	margin: 20rpx 0;
	.box {
		display: inline-flex;
		border-radius: 5rpx;
		overflow: hidden;
	}
	.li {
		@include styles('border-color', 'primary');
		@include styles('color', 'minorColor');
		display: inline-flex;
		justify-content: center;
		align-items: center;
		width: 240rpx;
		height: 60rpx;
		line-height: 1;
		font-size: 26rpx;
		border-width: 1rpx;
		border-style: solid;
		&.active {
			@include styles('background', 'primary');
			color: #fff !important;
		}
	}
}
</style>

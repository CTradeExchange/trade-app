<template>
    <view class='etf-icon'>
        <span>ETF</span>
    </view>
</template>

<script>
export default {
	
}
</script>

<style lang="scss" scoped>
.etf-icon {
	display: inline-flex;
	span {
		@include styles('color', 'primary');
		@include styles('border-color', 'primary');
		line-height: 1;
		padding: 4rpx 6rpx;
		font-size: 22rpx;
		border-style: solid;
		border-width: 1px;
		border-radius: 6rpx;
	}
}
</style>

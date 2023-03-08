<template>
    <view class='minorTip'>
        {{ $t('fundInfo.fundChartTip') }}
    </view>
</template>

<script>
</script>

<style lang="scss" scoped>
.minorTip{
	@include styles('color', 'minorColor');
    text-align: center;
	margin-top: rem(50px);
	font-size: 27rpx;
}
</style>

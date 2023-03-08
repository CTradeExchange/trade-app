<template>
    <view class='none-data'>
        <image class='img' src='/static/image/icon/empty.png' />
        <view class='text'>
            {{ text || $t('common.noData') }}
        </view>
    </view>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
.none-data {
    @include flexColumnCenter;
    flex: 1;
    padding: 80rpx 0;
    .img {
        width: 300rpx;
        height: 300rpx;
    }
    .text {
        @include styles('color', 'minorColor');
		padding: 0 25rpx;
        margin-top: 25rpx;
        font-size: 27rpx;
        letter-spacing: 1rpx;
    }
}
</style>

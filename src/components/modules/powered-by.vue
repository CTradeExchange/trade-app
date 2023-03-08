<template>
    <view class='powered'>
        <span>{{ text }}</span>
    </view>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: 'Powered by CATS'
        }
    }
}
</script>

<style lang='scss' scoped>
.powered {
    @include styles('color', 'minorColor');
    display: flex;
    justify-content: center;
	flex-shrink: 0;
    padding: 30rpx 0;
    font-size: 28rpx;
}
</style>

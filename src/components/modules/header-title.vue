<template>
    <view v-if='title' class='header-title'>
        {{ title }}
    </view>
</template>

<script>
export default {
    props: {
        // 标题
        title: {
            type: String,
            default: ''
        }
    }
}
</script>

<style lang="scss" scoped>
.header-title {
	@include styles('background', 'contentColor');
	@include styles('color', 'color');
	padding: 0 30rpx 25rpx;
	font-size: 45rpx;
}
</style>

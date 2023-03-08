<template>
    <view class='float-tip' :style="{ 'top': systemInfo.navbarHeight + 'px' }">
        <slot></slot>
    </view>
</template>

<script>	
export default {
   
}
</script>

<style lang="scss" scoped>
.float-tip {
	@include flexAll;
	@include styles('color', 'warn');
    position: fixed;
	top: 100px;
    left: 0;
	z-index: 99;
    width: 100%;
    height: 50rpx;
	font-size: 26rpx;
    background-color: #FFF0E2;
}
</style>

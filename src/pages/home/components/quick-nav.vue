<template>
    <view class='quick-nav'>
        <!-- 未登录 -->
        <template v-if='!customerInfo'>
            <view class='item tui-skeleton-rect' @click='goLogin'>
                <image mode='widthFix' :src="getImage('login')" />
            </view>
            <view class='item tui-skeleton-rect' @click='goRegister'>
                <image mode='widthFix' :src="getImage('register')" />
            </view>
        </template>
        <!-- 已登录 -->
        <template v-else>
            <view class='item tui-skeleton-rect' @click='goTrade'>
                <image mode='widthFix' :src="getImage('trade')" />
            </view>
            <view class='item tui-skeleton-rect' @click='goRecharge'>
                <image mode='widthFix' :src="getImage('recharge')" />
            </view>
        </template>
    </view>
</template>

<script>
export default {
    methods: {
        // 跳转到登录页面
        goLogin () {
            uni.navigateTo({
                url: '/pages/mine/login?module=home'
            })
        },
		
        // 跳转到注册页面
        goRegister () {
            uni.navigateTo({
                url: '/pages/mine/register?module=home'
            })
        },
		
        // 跳转到交易页面
        goTrade () {
            uni.switchTab({
                url: '/pages/order/index'
            })
        },
		
        // 跳转到充值页面
        goRecharge () {
            uni.navigateTo({
                url: '/pages/deposit/choose?tradeType=5'
            })
        },
		
        // 获取图片
        getImage (name) {
            try {
                return require('static/image/pic/' + this.currentLang + '/' + name + '.jpg')
            } catch (error) {
                return require('static/image/pic/' + 'zh-CN/' + name + '.jpg')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.quick-nav {
    @include styles('background', 'contentColor');
    display: flex;
    justify-content: space-between;
    padding: 15rpx 0 6rpx;
    .item {
        image {
            width: 370rpx;
            height: 256rpx;
        }
    }
}
</style>

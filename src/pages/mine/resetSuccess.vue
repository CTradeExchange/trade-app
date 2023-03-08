<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <view class='layout-content'>
                <tui-icon :color='$style.success' name='circle-fill' size='60' />
                <view class='t1'>
                    {{ $t('forgot.newPwdSuccess') }}
                </view>
                <view class='t2'>
                    {{ $t('forgot.newPwdLogin') }}
                </view>
                <view class='btn-wrap'>
                    <button class='confirmBtn' @click='toLogin'>
                        {{ $t('forgot.goLogin') }}
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    components: {
        
    },
    data () {
        return {}
    },
    methods: {
        toLogin () {
            uni.navigateTo({
                url: '/pages/mine/login'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.layout-content{
    @include styles('background-color', 'contentColor');
    padding: 200rpx 30rpx;
    .t1{
        margin-top: 70rpx;
        text-align: center;
        font-size: 40rpx;
    }
    .t2{
        margin-top: 20rpx;
        text-align: center;
        @include styles('color', 'normalColor');
    }
    .btn-wrap {
        .confirmBtn {
            @include flexAll;
            @include styles('background-color', 'primary');
            @include styles('border-color', 'lineColor');
            height: 100rpx;
            margin-top: 60rpx;
            font-size: 32rpx;
			color: #fff;
            border-style: solid;
            border-width: 1rpx;
            border-radius: 10rpx;
        }
    }
}

</style>

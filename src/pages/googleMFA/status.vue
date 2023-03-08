<template>
    <view class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container-full'>
            <!-- 头部导航栏 -->
            <nav-bar :title="$t('mfa.routeTitile')" />
            <!-- 内容区域 -->
            <view class='layout-content'>
                <view class='bigIcon'>
                    <i class='iconfont icon_dunpai'></i>
                </view>
                <view class='desc'>
                    {{ $t("mfa.enableDesc") }}
                </view>

                <view class='cell'>
                    <text>{{ $t("mfa.enableTitle") }}</text>
                    <switch
                        :checked='statusChecked'
                        class='switch'
                        @change='onUpdateStatus'
                    />
                </view>

                <!-- <van-cell :title='$t("mfa.enableTitle")'>
                    <template #right-icon>
                        <van-switch :active-color='$style.primary' :model-value='statusChecked' size='24px' @update:model-value='onUpdateStatus' />
                    </template>
                </van-cell> -->
            </view>
        </view>
    </view>
</template>

<script>
import store from '@/store/index.js'
export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: false,
            statusChecked: false
        }
    },
    onShow () {
        const that = this
        this.$init().then(() => {
            console.log(' store.state._user.customerInfo?.googleId=', store.state._user.customerInfo?.googleId);
            that.statusChecked = store.state._user.customerInfo?.googleId > 0
          
        }).catch(() => {
            this.skeletonShow = false
        })
    },
    methods: {
        onUpdateStatus (newValue) {
            this.statusChecked = newValue.detail.value
            const url = newValue.detail.value ? '/pages/googleMFA/install' : '/pages/googleMFA/bind'
            uni.navigateTo({
                url: url
            })
        }
    }
}
</script>

<style lang='scss' scoped>
.layout-content {
    .bigIcon {
        @include styles('color', 'primary');
        padding-top: 100rpx;
        padding-bottom: 40rpx;
        text-align: center;
        .iconfont {
            font-size: 180rpx;
        }
    }
    .desc {
        @include styles('color', 'minorColor');
        padding-bottom: 100rpx;
        text-align: center;
    }
    .cell {
        @include styles('background-color', 'contentColor');
        display: flex;
        justify-content: space-between;
        padding: 0 30rpx;
        line-height: 90rpx;
        .switch {
            transform: scale(0.85);
        }
    }
}
</style>

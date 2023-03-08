<template>
    <!-- 导航栏 -->
    <view class='nav-bar'>
        <!-- 状态栏 -->
        <view class='nav-status-bar' :style="{ 'height': systemInfo.statusBarHeight + 'px' }" />
        <!-- 状态栏占位 -->
        <view :style="{ 'height': systemInfo.statusBarHeight + 'px' }" />

        <!-- 标题栏 -->
        <view
            v-if='showTitleBar'
            :style="isFixed ? 'position: fixed; z-index: 999; width: 100%; left: 0; top:'+ systemInfo.statusBarHeight +'px' : ''"
        >
            <!-- 默认标题栏 -->
            <view
                v-if='!isCustom'
                class='nav-title-bar default-title-bar'
                :style="{ 'height': systemInfo.titleBarHeight + 'px' }"
            >
                <view v-if='backShow' class='back' @click='onBack'>
                    <!-- <tui-icon
                        v-if='homeShow'
                        class='home'
                        :color='$style.color'
                        name='home'
                        :size='45'
                        unit='rpx'
                    /> -->
                    <tui-icon
                        class='arrow'
                        :color='$style.color'
                        name='arrowleft'
                        :size='60'
                        unit='rpx'
                    />
                </view>
                <view v-if='closeShow' class='close' @click='onClose'>
                    <tui-icon
                        class='arrow'
                        :color='$style.color'
                        name='shut'
                        :size='50'
                        unit='rpx'
                    />
                </view>
                <view class='title'>
                    {{ fixedTitle || title }}
                </view>
                <view v-if='rightText' class='nav-link' @click="$emit('link')">
                    <span>{{ rightText }}</span>
                    <tui-icon :color='$style.minorColor' name='arrowright' :size='34' unit='rpx' />
                </view>
            </view>
            <!-- 自定义标题栏 -->
            <view v-else class='nav-title-bar custom-title-bar' :style="{ 'height': systemInfo.titleBarHeight + 'px' }">
                <view v-if='backShow' class='back' @click='onBack'>
                    <!-- <tui-icon
                        v-if='homeShow'
                        class='home'
                        :color='$style.color'
                        name='home'
                        :size='45'
                        unit='rpx'
                    /> -->
                    <tui-icon
                        class='arrow'
                        :color='$style.color'
                        name='arrowleft'
                        :size='60'
                        unit='rpx'
                    />
                </view>
                <view v-if='showCustomTitle' class='title'>
                    {{ fixedTitle || title }}
                </view>
                <slot></slot>
            </view>
        </view>
        <!-- 标题栏占位 -->
        <view v-if='showTitleBar && isFixed' :style="{ 'height': systemInfo.titleBarHeight + 'px' }" />
    </view>
</template>

<script>
export default {
    props: {
        // 是否显示返回按钮
        backShow: {
            type: Boolean,
            default: true
        },
        // 是否显示关闭按钮，一般使用在webview头部栏
        closeShow: {
            type: Boolean,
            default: false
        },
        // 导航栏标题
        title: {
            type: String,
            default: ''
        },
        // 是否显示标题栏
        showTitleBar: {
            type: Boolean,
            default: true
        },
        // 是否固定定位标题栏
        isFixed: {
            type: Boolean,
            default: true
        },
        // 是否自定义标题栏
        isCustom: {
            type: Boolean,
            default: false
        },
        // 自定义标题栏是否显示标题
        showCustomTitle: {
            type: Boolean,
            default: false
        },
        // 固定标题名称
        fixedTitle: {
            type: String,
            default: ''
        },
        // 右侧页面文案
        rightText: {
            type: String,
            default: ''
        },
        // 是否自定义返回事件
        customBack: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // 当前页面路径
            route: '',
            // 是否显示回到首页按钮
            homeShow: false
        }
    },
    mounted () {
        setTimeout(() => {
            // 设置是否显示回到首页按钮
            const pages = getCurrentPages()
            this.homeShow = pages.length === 1 && !this.customBack
        }, 500)
    },
    methods: {
        // 点击返回按钮
        onBack () {
            // 自定义返回
            if (this.customBack) {
                this.$emit('back')
            } else {
                // 返回首页
                if (this.homeShow) {
                    uni.reLaunch({
                        url: '/pages/home/index'
                    })
                } else {
                    // 返回上一页
                    uni.navigateBack({
                        delta: 1
                    })
                }
            }
        },
        // 点击关闭
        onClose () {
            this.$emit('close')
        }
    }
}
</script>

<style lang="scss" scoped>
/* 导航栏 */
.nav-bar {
    position: relative;
    z-index: 999;
    width: 100%;
    transition: ease-out 0.2s;
}
.nav-status-bar {
    @include styles('background-color', 'contentColor');
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
}
.nav-title-bar {
    @include styles('background-color', 'contentColor');
    display: flex;
    align-items: center;
    justify-content: center;
    .back,.close {
        position: absolute;
        left: 0;
        z-index: 999;
        display: inline-flex;
        align-items: center;
        height: 100%;
        padding: 0 22rpx;
        .arrow {
            margin-left: -16rpx;
        }
    }
    .close{
        left: 70rpx;
    }
    .title {
        font-size: 34rpx;
        line-height: 36rpx;
        //width: 400rpx;
        text-align: center;
		font-weight: bold;
    }
    .nav-link {
        @include flexAll;
        position: absolute;
        top: 0;
        right: 20rpx;
        height: 100%;
        span {
            @include styles('color', 'color');
            margin-right: -4rpx;
            font-size: 26rpx;
        }
    }
}
/* 默认标题栏 */
.default-title-bar {
    .back {
        @include styles('color', 'color');
    }
    .title {
        @include styles('color', 'color');
    }
}
/* 自定义标题栏 */
.custom-title-bar {
    .back {
        @include styles('color', 'color');
    }
}
</style>

<template>
    <!-- 骨架屏内容 -->
    <view class='skeleton-content'>
        <view class='signal'>
            <view class='tui-skeleton-rect title' />
            <view class='tui-skeleton-rect list' />
            <view class='tui-skeleton-rect list' />
        </view>
        <view class='option'>
            <view class='tui-skeleton-rect btn' />
            <view class='tui-skeleton-rect btn' />
        </view>
        <view class='menu'>
            <view v-for='(item, index) in 3' :key='index' class='menu-item'>
                <view class='tui-skeleton-rect symbol' />
                <view class='tui-skeleton-rect title' />
                <view class='tui-skeleton-rect desc' />
            </view>
        </view>
        <view class='quick-nav'>
            <view class='item tui-skeleton-rect' />
            <view class='item tui-skeleton-rect' />
            <view class='item tui-skeleton-rect' />
            <view class='item tui-skeleton-rect' />
        </view>
        <view class='tabs-content'>
            <view class='tabs-options tui-skeleton-rect' />
            <view class='news-list'>
                <block v-for='(item, index) in 5' :key='index' class='block'>
                    <view class='news-flex'>
                        <view class='news-tbox'>
                            <view class='news-title tui-skeleton-rect' />
                            <view class='sub-box'>
                                <view class='sub-source tui-skeleton-rect' />
                                <view class='sub-cmt tui-skeleton-rect' />
                            </view>
                        </view>
                        <view class='news-picbox tui-skeleton-rect'>
                            <image class='thumb' lazy-load :src='item.image' />
                        </view>
                    </view> 
                </block>
            </view>
        </view>
    </view>     
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>
.skeleton-content {
    .signal {
        display: flex;
        align-items: center;
        flex-direction: column;
        margin-top: 60rpx;
        padding: 20rpx 25rpx;
        .title {
            width: 60%;
            height: 50rpx;
            margin: 20rpx 0;
        }
        .list {
            width: 100%;
            margin: 10rpx 0;
            height: 50rpx;
        }
        .signal-list {
            padding: 15rpx 0 6rpx;
            width: 375rpx;
            height: 100rpx;
            .item {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100rpx;
                height: 100rpx;
            }
        }
    }
    .option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 25rpx;
        .btn {
            width: 49%;
            height: 100rpx;
        }
    }
    .menu {
        display: flex;
        padding: 20rpx 25rpx;
        .menu-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            padding: 0 30rpx;
            .symbol {
                width: 120rpx;
                height: 36rpx;
                margin-top: 12rpx;
            }
            .title {
                width: 120rpx;
                height: 36rpx;
                margin-top: 12rpx;
            }
            .desc {
                width: 140rpx;
                height: 30rpx;
                margin-top: 12rpx;
            }
        }
    }
    .quick-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 40rpx 25rpx;
        .item {
            width: 24%;
            height: 140rpx;
        }
    }
    .tabs-options {
        display: flex;
        height: 90rpx;
    }
    .news-list {
        @include styles('background-color', 'contentColor');
        .block {
            margin-bottom: 100rpx;
        }
        .news-flex {
            display: flex;
            padding: 22rpx 25rpx;
            .news-tbox {
                flex: 1;
                padding-right: 28rpx;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                margin-bottom: 25rpx;
                .news-title {
                    @include styles('color', 'color');
                    font-size: 28rpx;
                    height: 50rpx;
                }
                .sub-box {
                    @include styles('color', 'minorColor');
                    display: flex;
                    font-size: 26rpx;
                    justify-content: space-between;
                    width: 100%;
                    .sub-source {
                        width: 100rpx;
                        height: 34rpx;
                    }
                    .sub-cmt {
                        width: 140rpx;
                        height: 34rpx;
                    }
                }
            }
            .news-picbox {
                width: 240rpx;
                .thumb {
                    @include styles('background', 'assistColor');
                    width: 240rpx;
                    height: 160rpx;
                    border-radius: 6rpx;
                }
            }
        }
    }
}

</style>

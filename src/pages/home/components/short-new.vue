<template>
    <view class='news-list' :class='currentTheme'>
        <view class='story-date'>
            {{ today }}
        </view>
        <block v-for='(item, index) in list' :key='index'>
            <view class='item-out'>
                <view class='story-item'>
                    <view class='iconfont icon-yuandianxiao' />
                    <view class='story-time'>
                        {{ item.addtime_text.slice(11, 16) }}
                    </view>
                    <view class='story-desc'>
                        <view class='story-text story-ellipsis'>
                            {{ item.title }}
                        </view>
                    </view>
                </view>
            </view>
        </block>
    </view>
</template>

<script>
import dayjs from 'dayjs'
export default {
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        today () {
            return dayjs().format('YYYY年MM月DD日')
        } 
    }
}
</script>

<style lang="scss" scoped>
.news-list {
    padding: 0 40rpx;
    @include styles('background-color', 'contentColor');
    .story-date {
        padding: 0 26rpx;
        @include styles('color', 'placeholdColor');
        font-weight: 700;
        font-size: 26rpx;
        line-height: 80rpx;
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
            .news-title {
                @include styles('color', 'color');
                font-size: 27rpx;
            }
            .sub-box {
                @include styles('color', 'minorColor');
                display: flex;
                font-size: 25rpx;
                justify-content: space-between;
            }
        }
        .news-picbox {
            width: 240rpx;
            .thumb {
                width: 240rpx;
                height: 160rpx;
            }
        }
    }
    .item-out {
        padding-bottom: 20rpx;
        border-bottom: 1px solid;
        @include styles('border-color', 'bgColor');
        .story-item {
            position: relative;
            padding-left: 32rpx;
            margin-top: 20rpx;
            &::before {
                position: absolute;
                top: 0;
                left: 0;
                width: 1px;
                height: 100%;
                @include styles('background-color', 'lineColor');
                content: '';
            }
            &::after {
                position: absolute;
                top: 32rpx;
                left: -6rpx;
                width: 14rpx;
                height: 14rpx;
                @include styles('background-color', 'lineColor');
                border-radius: 14rpx;
                content: '';
            }
            .icon-yuandianxiao {
                position: absolute;
                top: 14rpx;
                left: -18rpx;
                @include styles('color', 'assistColor');
                font-size: 40rpx;
            }
            .story-time {
                padding-top: 22rpx;
                padding-bottom: 6rpx;
                @include styles('color', 'placeholdColor');
                font-size: 26rpx;
            }
            .story-text {
                display: -webkit-box;
                overflow: hidden;
                @include styles('color', 'color');
                font-size: 28rpx;
                line-height: 52rpx;
                text-overflow: ellipsis;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
            }
        }
    }
    &.night{
        .story-date {
            @include styles('color', 'color');
        }
        .item-out {
            .story-item{
                &::before, &::after{
                    @include styles('background-color', 'color');
                }
            }
            .story-time {
                @include styles('color', 'color');
            }
            .story-text{
                @include styles('color', 'normalColor');
            }
        }
    }
}
</style>

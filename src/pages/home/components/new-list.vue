<template>
    <view class='news-list'>
        <block v-for='(item, index) in list' :key='index'>
            <view class='news-flex' @click='goDetail(item)'>
                <view class='news-tbox'>
                    <view class='news-title tui-skeleton-rect'>
                        {{ item.title }}
                    </view>
                    <view class='sub-box'>
                        <view class='sub-source tui-skeleton-rect'>
                            {{ item.resource }}
                        </view>
                        <view class='sub-cmt tui-skeleton-rect'>
                            <view>{{ item.updatetimeStr }}</view>
                        </view>
                    </view>
                </view>
                <view class='news-picbox tui-skeleton-rect'>
                    <image class='thumb' lazy-load :src='item.image' />
                </view>
            </view>
        </block>
    </view>
</template>

<script>
export default {
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        },
        // 机构id
        orgid: {
            type: [Number, String],
            default: ''
        }
    },
    methods: {
        // 跳转到详情页面
        goDetail (item) {
            uni.navigateTo({
                url: `/pages/news/detail?orgid=${this.orgid}&id=${item.id}`
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.news-list {
    @include styles('background-color', 'contentColor');
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
                font-size: 28rpx;
            }
            .sub-box {
                @include styles('color', 'minorColor');
                display: flex;
                font-size: 26rpx;
                justify-content: space-between;
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
</style>

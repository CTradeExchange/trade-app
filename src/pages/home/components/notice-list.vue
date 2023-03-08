<template>
    <view v-if='list.length > 0' class='notice-list'>
        <view class='news'>
            <tui-icon class='icon-notice' name='news' :size='20' />
            <swiper autoplay circular class='tui-swiper' interval='3000' vertical>
                <swiper-item
                    v-for='(item,index) in list'
                    :key='index'
                    class='tui-swiper-item'
                >
                    <view class='tui-news-item' @click='goDetail(item)'>
                        {{ item.title }}
                    </view>
                </swiper-item>
            </swiper>
            <view class='more' @click='goMore'>
                {{ $t('home.more') }}
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        // 列表数据
        list: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        // 跳转到详情页面
        goDetail (item) {
            uni.navigateTo({
                url: `/pages/notice/detail?id=${item.id}`
            })
        },
        // 更多
        goMore () {
            uni.navigateTo({
                url: '/pages/notice/index'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.notice-list {
    .news {
        display: flex;
        align-items: center;
        height: rem(70px);
        padding: 40rpx 16rpx;
        uni-swiper {
            height: rem(60px);
            flex: 1;
            margin-left: rem(16px);
        }
        .tui-swiper-item {
            display: flex;
            align-items: center;
            overflow: hidden;
            .tui-news-item {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-size: rem(26px);
                @include styles('color', 'minorColor');
            }
        }
        .more{
            font-size: rem(26px);
            margin-left: rem(20px);
            @include styles('color', 'minorColor');
        }
    }
    .icon-notice {
        @include styles('color', 'primary');
    }
}
</style>

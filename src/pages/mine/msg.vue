<template>
    <view :change-color='changeColor' class='layout' :data-theme='currentTheme'>
        <tui-skeleton v-if='skeletonShow' />
        <view class='tui-skeleton layout-container'>
            <!-- 头部导航栏 -->
            <nav-bar is-custom show-custom-title :title="$t('cRoute.msg')">
                <div class='header-select'>
                    <dropdown-item
                        :list='options'
                        :model-value.sync='type'
                        @update:modelValue='changeType'
                    />
                </div>
            </nav-bar> 
		
            <!-- 中间内容区域 -->
            <view class='layout-content'>
                <!-- 标题栏 -->
                <template v-if='list.length > 0'>
                    <div class='msg-list'>
                        <div v-for='(item,index) in list' :key='index' class='msg-item'>
                            <p class='msg-title'>
                                {{ item.title === 'null'? '': item.title }}
                            </p>
                            <p class='msg-content'>
                                {{ computeHtmlTime(item.content) }}
                            </p>
                            <p class='msg-time'>
                                {{ formatTime(item.createTime) }}
                            </p>
                        </div>
                    </div>
                    <loading-more :status='loadStatus' />
                </template>
                <none-data v-else />
            </view>
        </view>
		
        <!-- 提示弹窗 -->
        <modal-dialog ref='modalDialog' />
        <!-- 通知弹窗 -->
        <notice-dialog ref='noticeDialog' />
    </view>
</template>

<script>
import { computeHtmlTime } from '@/utils/util.js'
import { queryPlatFormMessageLogList } from '@/api/user.js'

export default {
    data () {
        return {
            // 是否显示骨架屏
            skeletonShow: true,
            // 下拉消息选项
            options: [
                {
                    'text': this.$t('msg.all'),
                    'value': ''
                },
                {
                    'text': this.$t('msg.accountMsg'),
                    'value': 'USER_MESSAGE'
                },
                {
                    'text': this.$t('msg.assetsMsg'),
                    'value': 'CASH_MESSAGE'
                },
                {
                    'text': this.$t('msg.tradeMsg'),
                    'value': 'TRADE_MESSAGE'
                }
            ],
            // 当前消息类型
            type: '',
            // 数据列表
            list: [],
            // 当前页数
            current: 1,
            // 页数数量
            size: 10,
            // 加载状态
            loadStatus: 'more'
        }
    },
    onLoad () {
        // 初始化
        this.$init().then(() => {
            this.getMsgList()
        }).catch(() => {
            this.skeletonShow = false
        })
		
        // 添加应用内事件
        this.$addAppsEvent('message_view')
    },
    // 下拉刷新
    onPullDownRefresh () {
        setTimeout(() => {
            this.pageInit()
            uni.stopPullDownRefresh()
            this.getMsgList()
        }, 800)
    },
    // 上拉加载
    onReachBottom () {
        this.getMsgList()
    },
    methods: {
        pageInit () {
            this.current = 1
            this.loadStatus = 'more'
        },
		
        changeType () {
            this.pageInit()
            uni.showLoading({
                title: this.$t('common.loading'),
                mask: true
            })
            this.getMsgList()
        },
		       
        getMsgList () {
            if (this.loadStatus !== 'more') return 
            this.loadStatus = 'loading'
            queryPlatFormMessageLogList({
                current: this.current,
                parentType: this.type,
                size: this.size
            }).then(res => {
                this.skeletonShow = false
                uni.hideLoading()
                const records = res.data.records
                this.list = this.current === 1 ? records : this.list.concat(records)
                this.current += 1
                this.loadStatus = this.list.length === res.data.total ? 'noMore' : 'more'
            }).catch(() => {
                uni.hideLoading()
                this.skeletonShow = false
            })
        },

        computeHtmlTime (content) {
            return computeHtmlTime(content)
        }
    }
}
</script>

<style lang="scss" scoped>
.header-select {
    @include flexAll;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    &::v-deep .dropdown-item {
        padding: 0 25rpx;
    }
}
.msg-list {
    @include styles('background-color', 'bgColor');
    .msg-item {
        margin: 15rpx 15rpx 0;
        padding: 20rpx;
        @include styles('background-color', 'contentColor');
        .msg-title {
            @include styles('color', 'color');
            font-weight: bold;
            font-size: 28rpx;
            line-height: 60rpx;
        }
        .msg-content {
            @include styles('color', 'color');
            font-weight: 500;
            font-size: 24rpx;
            line-height: 36rpx;
        }
        .msg-time {
            @include styles('color', 'minorColor');
            font-weight: 400;
            font-size: 20rpx;
            line-height: 60rpx;
        }
    }
}
</style>
